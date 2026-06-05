import { apiRequest, zparse } from "./client";
import {
  OnboardingStatusSchema,
  type OnboardingStatus,
  type UpdateOnboardingManualStepsInput,
} from "@/lib/schemas/onboarding.schema";

export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const data = await apiRequest<unknown>(`/onboarding-status/${userId}`);
  return zparse(OnboardingStatusSchema, data);
}

export async function updateOnboardingManualSteps(
  userId: string,
  input: UpdateOnboardingManualStepsInput
): Promise<OnboardingStatus> {
  const data = await apiRequest<unknown>(`/onboarding-status/${userId}`, {
    method: "PATCH",
    body: input,
  });
  return zparse(OnboardingStatusSchema, data);
}
