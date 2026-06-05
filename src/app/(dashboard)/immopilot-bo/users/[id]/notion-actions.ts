"use server";

import { revalidatePath } from "next/cache";
import { getNotionConfig, upsertNotionConfig } from "@/lib/api/notion";
import { UpdateNotionConfigSchema } from "@/lib/schemas/notion.schema";

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
