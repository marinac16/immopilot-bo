"use server";

import { revalidatePath } from "next/cache";
import { updateOnboardingManualSteps } from "@/lib/api/onboarding";

type ManualStepKey =
  | "notionWorkspaceReady"
  | "notionIntegrationCreated"
  | "notionBasesShared"
  | "googleTestUserAdded"
  | "onboardingValidated";

type State = { error?: string; success?: boolean } | undefined;

export async function toggleOnboardingStepAction(
  userId: string,
  step: ManualStepKey,
  value: boolean
): Promise<State> {
  try {
    await updateOnboardingManualSteps(userId, { [step]: value });
    revalidatePath(`/immopilot-bo/users/${userId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de la mise à jour." };
  }
}
