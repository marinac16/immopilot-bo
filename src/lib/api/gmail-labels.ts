import { apiRequest, zparse } from "./client";
import { GmailLabelListSchema, type GmailLabel } from "@/lib/schemas/gmail-label.schema";

export async function getGmailLabels(userId: string): Promise<GmailLabel[]> {
  const data = await apiRequest<unknown>(`/users/${userId}/gmail/immopilot-labels`);
  return zparse(GmailLabelListSchema, data);
}

export async function setupGmailLabels(userId: string): Promise<GmailLabel[]> {
  const data = await apiRequest<unknown>(`/users/${userId}/gmail/setup-labels`, {
    method: "POST",
  });
  return zparse(GmailLabelListSchema, data);
}
