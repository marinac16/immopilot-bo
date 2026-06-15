import { apiRequest, zparse } from "./client";
import {
  NotionConfigSchema,
  type NotionConfig,
  type UpdateNotionConfigInput,
} from "@/lib/schemas/notion.schema";

export async function getNotionConfig(userId: string): Promise<NotionConfig> {
  const data = await apiRequest<unknown>(`/notion-config/${userId}`);
  return zparse(NotionConfigSchema, data);
}

export async function upsertNotionConfig(
  userId: string,
  input: UpdateNotionConfigInput
): Promise<NotionConfig> {
  // notionParentPageId : champ BO uniquement tant que l'API ne l'expose pas en base
  const { notionParentPageId: _parentPageId, ...apiInput } = input;

  const data = await apiRequest<unknown>(`/notion-config/${userId}`, {
    method: "PUT",
    body: apiInput,
  });
  return zparse(NotionConfigSchema, data);
}
