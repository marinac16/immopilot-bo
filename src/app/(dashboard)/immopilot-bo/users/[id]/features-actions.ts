"use server";

import { revalidatePath } from "next/cache";
import { assignFeature, toggleFeature, removeFeature } from "@/lib/api/features";

export async function toggleFeatureAction(
  userId: string,
  featureId: string,
  userFeatureId: string | null,
  currentEnabled: boolean
): Promise<void> {
  if (!userFeatureId) {
    await assignFeature(userId, featureId);
  } else if (currentEnabled) {
    await removeFeature(userId, featureId);
  } else {
    await toggleFeature(userId, featureId, true);
  }
  revalidatePath(`/immopilot-bo/users/${userId}`);
}
