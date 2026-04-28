"use server";

import { revalidatePath } from "next/cache";
import { upsertBranding } from "@/lib/api/branding";
import { UpdateBrandingSchema } from "@/lib/schemas/branding.schema";

type State = { error?: string; success?: boolean; fieldErrors?: Record<string, string[]> } | undefined;

export async function updateBrandingAction(
  userId: string,
  state: State,
  formData: FormData
): Promise<State> {
  const raw = {
    emailHeaderUrl: formData.get("emailHeaderUrl") || undefined,
    emailFooterUrl: formData.get("emailFooterUrl") || undefined,
  };

  const parsed = UpdateBrandingSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await upsertBranding(userId, parsed.data);
    revalidatePath("/immopilot-bo/branding");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de la mise à jour." };
  }
}
