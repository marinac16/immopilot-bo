"use server";

import { revalidatePath } from "next/cache";
import { upsertNotionConfig } from "@/lib/api/notion";
import { UpdateNotionConfigSchema } from "@/lib/schemas/notion.schema";

type State = { error?: string; success?: boolean } | undefined;

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
