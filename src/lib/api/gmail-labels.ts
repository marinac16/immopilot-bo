import { apiRequest, zparse } from "./client";
import { GmailLabelListSchema, type GmailLabel } from "@/lib/schemas/gmail-label.schema";

export async function getGmailLabels(userId: string): Promise<GmailLabel[]> {
  const data = await apiRequest<unknown>("/gmail/labels", {
    method: "POST",
    body: { userId },
  });
  return zparse(GmailLabelListSchema, data);
}
