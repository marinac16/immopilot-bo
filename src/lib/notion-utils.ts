/**
 * Extrait l'ID d'une page Notion depuis une URL, un UUID ou un ID brut (32 hex).
 */
export function parseNotionPageId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(trimmed)) return trimmed;

  if (/^[0-9a-f]{32}$/i.test(trimmed)) return trimmed;

  const path = trimmed.split("?")[0];

  // URL ou slug sans tiret : 32 hex en suffixe (ex. app.notion.com/p/WorkspaceTitle{32hex})
  const trailingHex = path.match(/([0-9a-f]{32})$/i);
  if (trailingHex) return trailingHex[1];

  // Slug avec tiret avant l'ID (ex. notion.so/Page-Title-{32hex})
  const lastDash = path.lastIndexOf("-");
  if (lastDash !== -1) {
    const candidate = path.slice(lastDash + 1);
    if (/^[0-9a-f]{32}$/i.test(candidate)) return candidate;
  }

  return "";
}

/**
 * Formate un ID Notion (32 hex) en UUID pour l'API.
 */
export function formatNotionUuid(id: string): string {
  const clean = id.replace(/-/g, "");
  if (clean.length !== 32) return id;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

/**
 * Vérifie qu'une chaîne est un ID Notion valide (UUID ou 32 hex).
 */
export function isValidNotionId(id: string): boolean {
  const clean = id.replace(/-/g, "");
  return /^[0-9a-f]{32}$/i.test(clean);
}
