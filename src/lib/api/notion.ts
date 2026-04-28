import { apiRequest } from "./client";
import {
  NotionConfigSchema,
  type NotionConfig,
  type UpdateNotionConfigInput,
} from "@/lib/schemas/notion.schema";

export async function getNotionConfig(userId: string): Promise<NotionConfig> {
  const data = await apiRequest<unknown>(`/notion-config/${userId}`);
  return NotionConfigSchema.parse(data);
}

export async function upsertNotionConfig(
  userId: string,
  input: UpdateNotionConfigInput
): Promise<NotionConfig> {
  const data = await apiRequest<unknown>(`/notion-config/${userId}`, {
    method: "PATCH",
    body: input,
  });
  return NotionConfigSchema.parse(data);
}
