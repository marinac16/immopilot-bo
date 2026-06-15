"use server";

import { revalidatePath } from "next/cache";
import { getNotionConfig, upsertNotionConfig } from "@/lib/api/notion";
import { UpdateNotionConfigSchema } from "@/lib/schemas/notion.schema";
import { formatNotionUuid, isValidNotionId } from "@/lib/notion-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type State = { error?: string; success?: boolean } | undefined;

type SyncResultItem = {
  field: string;
  label: string;
  notionName: string;
  id: string;
};

export type SyncResult = {
  matched: SyncResultItem[];
  notMatched: Array<{ field: string; label: string }>;
  error?: string;
};

// ─── Mapping databases → champs NotionConfig ─────────────────────────────────

const DB_MATCHERS: Array<{ field: string; label: string; keywords: string[] }> = [
  { field: "equipe",           label: "DB — Équipe",                  keywords: ["equipe"] },
  { field: "leadsAcquereurs",  label: "DB — Leads acquéreurs",        keywords: ["leads acquereurs", "leads"] },
  { field: "visites",          label: "DB — Visites",                 keywords: ["visites"] },
  { field: "relances",         label: "DB — Relances",                keywords: ["relances"] },
  { field: "biens",            label: "DB — Biens",                   keywords: ["biens"] },
  { field: "contacts",         label: "DB — Contacts",                keywords: ["contacts"] },
  { field: "templateMessages", label: "DB — Template messages",       keywords: ["config templates messages", "templates messages", "template messages"] },
  { field: "taches",           label: "DB — Tâches",                  keywords: ["taches", "todolist", "to-do list"] },
];

// ─── Mapping pages prompts → champs NotionConfig ──────────────────────────────

const PROMPT_MATCHERS: Array<{ field: string; label: string; keywords: string[] }> = [
  { field: "promptAgentAjouterTache", label: "Prompt — Ajouter une tâche", keywords: ["prompt", "ajouter"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchItem(
  notionName: string,
  matchers: Array<{ field: string; label: string; keywords: string[] }>
): { field: string; label: string } | null {
  const normalized = normalize(notionName);
  for (const matcher of matchers) {
    if (matcher.keywords.some((kw) => normalized.includes(kw))) {
      return { field: matcher.field, label: matcher.label };
    }
  }
  return null;
}

async function notionSearch(token: string, filter: "database" | "page", query?: string) {
  const res = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...(query ? { query } : {}),
      filter: { value: filter, property: "object" },
      page_size: 50,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Notion API error ${res.status}`);
  }

  const data = (await res.json()) as {
    results: Array<{ id: string; object: string; title?: Array<{ plain_text: string }>; properties?: { title?: { title?: Array<{ plain_text: string }> } } }>;
  };
  return data.results;
}

function getNotionTitle(item: { title?: Array<{ plain_text: string }>; properties?: { title?: { title?: Array<{ plain_text: string }> } } }): string {
  // Database title
  if (item.title) return item.title.map((t) => t.plain_text).join("").trim();
  // Page title (properties.title.title)
  return item.properties?.title?.title?.map((t) => t.plain_text).join("").trim() ?? "";
}

// ─── Détection des bases (formulaire) ───────────────────────────────────────

export type DetectNotionDatabasesResult =
  | { success: true; databases: { id: string; title: string }[] }
  | { success: false; error: string };

const NOTION_VERSION = "2022-06-28";

function notionHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
  };
}

function notionIdVariants(rawId: string): string[] {
  const clean = rawId.replace(/-/g, "");
  if (clean.length !== 32) return [rawId];
  const uuid = formatNotionUuid(clean);
  return [...new Set([uuid, clean])];
}

function getChildDatabaseTitle(
  childDatabase: { title?: string | Array<{ plain_text: string }> } | undefined
): string {
  const title = childDatabase?.title;
  if (!title) return "";
  if (typeof title === "string") return title;
  return title.map((t) => t.plain_text).join("");
}

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  child_database?: { title?: string | Array<{ plain_text: string }> };
};

type CollectResult = {
  databases: { id: string; title: string }[];
  status?: number;
};

async function fetchBlockChildren(
  token: string,
  blockId: string,
  cursor?: string
): Promise<
  | { ok: true; results: NotionBlock[]; has_more: boolean; next_cursor?: string }
  | { ok: false; status: number }
> {
  const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
  url.searchParams.set("page_size", "100");
  if (cursor) url.searchParams.set("start_cursor", cursor);

  const res = await fetch(url.toString(), { headers: notionHeaders(token) });
  if (!res.ok) return { ok: false, status: res.status };

  const data = (await res.json()) as {
    results: NotionBlock[];
    has_more: boolean;
    next_cursor?: string;
  };
  return { ok: true, results: data.results, has_more: data.has_more, next_cursor: data.next_cursor };
}

async function collectChildDatabases(
  token: string,
  blockId: string,
  depth = 0,
  visited = new Set<string>()
): Promise<CollectResult> {
  if (depth > 6 || visited.has(blockId)) return { databases: [] };
  visited.add(blockId);

  const databases: { id: string; title: string }[] = [];
  let cursor: string | undefined;

  do {
    const page = await fetchBlockChildren(token, blockId, cursor);
    if (!page.ok) {
      return { databases: [], status: page.status };
    }

    for (const block of page.results) {
      if (block.type === "child_database") {
        const title = getChildDatabaseTitle(block.child_database);
        if (title) databases.push({ id: block.id, title });
      } else if (block.has_children) {
        const nested = await collectChildDatabases(token, block.id, depth + 1, visited);
        if (nested.status === 401 || nested.status === 403) return nested;
        databases.push(...nested.databases);
      }
    }

    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);

  return { databases };
}

async function searchAllDatabases(token: string): Promise<{ id: string; title: string }[]> {
  const databases: { id: string; title: string }[] = [];
  let cursor: string | undefined;

  do {
    const res = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: { ...notionHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        filter: { value: "database", property: "object" },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });

    if (!res.ok) break;

    const data = (await res.json()) as {
      results: Array<{ id: string; title?: Array<{ plain_text: string }> }>;
      has_more: boolean;
      next_cursor?: string;
    };

    for (const result of data.results) {
      const title = result.title?.map((t) => t.plain_text).join("") ?? "";
      if (title) databases.push({ id: result.id, title });
    }

    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return databases;
}

async function isDatabaseUrl(token: string, rawId: string): Promise<boolean> {
  for (const id of notionIdVariants(rawId)) {
    const res = await fetch(`https://api.notion.com/v1/databases/${id}`, {
      headers: notionHeaders(token),
    });
    if (res.ok) return true;
    if (res.status === 401 || res.status === 403) return false;
  }
  return false;
}

export async function detectNotionDatabases(
  token: string,
  parentPageId: string
): Promise<DetectNotionDatabasesResult> {
  if (!token.startsWith("ntn_")) {
    return { success: false, error: "Token invalide" };
  }

  if (!parentPageId.trim()) {
    return { success: false, error: "Page parent requise" };
  }

  if (!isValidNotionId(parentPageId)) {
    return { success: false, error: "URL ou ID de page invalide, vérifiez le format" };
  }

  const cleanId = parentPageId.replace(/-/g, "");

  try {
    // 1. Resoudre la page via GET /pages (ID canonique)
    for (const id of notionIdVariants(cleanId)) {
      const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        headers: notionHeaders(token),
      });

      if (res.status === 401) {
        return { success: false, error: "Token Notion invalide ou expiré" };
      }
      if (res.status === 403) {
        return { success: false, error: "La page n'est pas partagée avec l'intégration Atelium Bot" };
      }
      if (res.ok) {
        const page = (await res.json()) as { id: string };
        const collected = await collectChildDatabases(token, page.id);
        if (collected.status === 401) {
          return { success: false, error: "Token Notion invalide ou expiré" };
        }
        if (collected.status === 403) {
          return { success: false, error: "La page n'est pas partagée avec l'intégration Atelium Bot" };
        }
        if (collected.databases.length > 0) {
          return { success: true, databases: collected.databases };
        }
        break;
      }
    }

    // 2. Essayer blocks/children directement (variantes d'ID)
    for (const id of notionIdVariants(cleanId)) {
      const collected = await collectChildDatabases(token, id);
      if (collected.status === 401) {
        return { success: false, error: "Token Notion invalide ou expiré" };
      }
      if (collected.status === 403) {
        return { success: false, error: "La page n'est pas partagée avec l'intégration Atelium Bot" };
      }
      if (collected.databases.length > 0) {
        return { success: true, databases: collected.databases };
      }
    }

    // 3. URL pointe peut-etre vers une base, pas la page parent
    if (await isDatabaseUrl(token, cleanId)) {
      return {
        success: false,
        error:
          "Cette URL pointe vers une base de données. Collez l'URL de la page parent ImmoPilot qui contient toutes les bases.",
      };
    }

    // 4. Fallback : search workspace (bases individuellement partagees)
    const searched = await searchAllDatabases(token);
    if (searched.length > 0) {
      return { success: true, databases: searched };
    }

    return {
      success: false,
      error:
        "Page introuvable ou non partagée avec l'intégration Atelium Bot. Ouvrez la page parent dans Notion, puis ··· → Connections → ajoutez Atelium Bot.",
    };
  } catch {
    return { success: false, error: "Erreur réseau lors de l'appel à l'API Notion." };
  }
}

// ─── Action principale ────────────────────────────────────────────────────────

export async function syncNotionDatabasesAction(userId: string): Promise<SyncResult> {
  // 1. Récupérer le token stocké
  let token: string | null | undefined;
  try {
    const config = await getNotionConfig(userId);
    token = config.notionToken;
  } catch {
    return { matched: [], notMatched: [], error: "Impossible de récupérer la config Notion. Vérifiez que l'utilisateur existe." };
  }

  if (!token) {
    return { matched: [], notMatched: [], error: "Token Notion manquant. Renseignez d'abord le token dans la config." };
  }

  // 2. Appels Notion en parallèle : databases + pages prompts
  let databases: Awaited<ReturnType<typeof notionSearch>>;
  let promptPages: Awaited<ReturnType<typeof notionSearch>>;

  try {
    [databases, promptPages] = await Promise.all([
      notionSearch(token, "database"),
      notionSearch(token, "page", "Prompt"),
    ]);
  } catch (err) {
    return {
      matched: [],
      notMatched: [],
      error: err instanceof Error ? err.message : "Erreur lors de l'appel à l'API Notion.",
    };
  }

  // 3. Mapper les databases
  const updates: Record<string, string> = {};
  const matched: SyncResultItem[] = [];
  const usedFields = new Set<string>();

  for (const db of databases) {
    const name = getNotionTitle(db);
    if (!name) continue;
    const match = matchItem(name, DB_MATCHERS);
    if (match && !usedFields.has(match.field)) {
      updates[match.field] = db.id.replace(/-/g, "");
      matched.push({ field: match.field, label: match.label, notionName: name, id: db.id });
      usedFields.add(match.field);
    }
  }

  // 4. Mapper les pages de prompts
  for (const page of promptPages) {
    const name = getNotionTitle(page);
    if (!name) continue;
    const match = matchItem(name, PROMPT_MATCHERS);
    if (match && !usedFields.has(match.field)) {
      updates[match.field] = page.id.replace(/-/g, "");
      matched.push({ field: match.field, label: match.label, notionName: name, id: page.id });
      usedFields.add(match.field);
    }
  }

  // 5. Calculer ce qui n'a pas été trouvé
  const allMatchers = [...DB_MATCHERS, ...PROMPT_MATCHERS];
  const notMatched = allMatchers
    .filter((m) => !usedFields.has(m.field))
    .map((m) => ({ field: m.field, label: m.label }));

  // 6. Sauvegarder en base
  if (Object.keys(updates).length > 0) {
    try {
      await upsertNotionConfig(userId, updates);
      revalidatePath(`/immopilot-bo/users/${userId}`);
    } catch (err) {
      return {
        matched,
        notMatched,
        error: err instanceof Error ? err.message : "IDs récupérés mais erreur lors de la sauvegarde.",
      };
    }
  }

  return { matched, notMatched };
}

// ─── Action save form ─────────────────────────────────────────────────────────

export async function updateNotionAction(
  userId: string,
  _state: State,
  formData: FormData
): Promise<State> {
  const raw = {
    notionToken: formData.get("notionToken") || undefined,
    notionParentPageId: formData.get("notionParentPageId") || undefined,
    leadsAcquereurs: formData.get("leadsAcquereurs") || undefined,
    visites: formData.get("visites") || undefined,
    biens: formData.get("biens") || undefined,
    relances: formData.get("relances") || undefined,
    equipe: formData.get("equipe") || undefined,
    contacts: formData.get("contacts") || undefined,
    taches: formData.get("taches") || undefined,
    templateMessages: formData.get("templateMessages") || undefined,
    promptAgentAjouterTache: formData.get("promptAgentAjouterTache") || undefined,
  };

  const parsed = UpdateNotionConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Données invalides." };
  }

  try {
    await upsertNotionConfig(userId, parsed.data);
    revalidatePath(`/immopilot-bo/users/${userId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de la mise à jour." };
  }
}
