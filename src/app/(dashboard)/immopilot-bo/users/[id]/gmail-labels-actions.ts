"use server";

import { revalidatePath } from "next/cache";
import { setupGmailLabels } from "@/lib/api/gmail-labels";
import type { GmailLabel } from "@/lib/schemas/gmail-label.schema";

export type SetupLabelsResult = {
  labels?: GmailLabel[];
  error?: string;
};

export async function setupGmailLabelsAction(userId: string): Promise<SetupLabelsResult> {
  try {
    const labels = await setupGmailLabels(userId);
    revalidatePath(`/immopilot-bo/users/${userId}`);
    return { labels };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de la création des labels." };
  }
}
