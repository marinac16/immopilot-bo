import { apiRequest } from "./client";
import {
  FeatureListSchema,
  UserFeatureListSchema,
  type Feature,
  type UserFeature,
} from "@/lib/schemas/feature.schema";

export async function getAllFeatures(): Promise<Feature[]> {
  const data = await apiRequest<unknown>("/features");
  return FeatureListSchema.parse(data);
}

export async function getUserFeatures(userId: string): Promise<UserFeature[]> {
  const data = await apiRequest<unknown>(`/user/${userId}/features`);
  return UserFeatureListSchema.parse(data);
}

export async function assignFeature(userId: string, featureId: string): Promise<UserFeature> {
  const data = await apiRequest<unknown>(`/user/${userId}/features`, {
    method: "POST",
    body: { featureId },
  });
  return UserFeatureListSchema.element.parse(data);
}

export async function toggleFeature(
  userId: string,
  featureId: string,
  enabled: boolean
): Promise<UserFeature> {
  const data = await apiRequest<unknown>(`/user/${userId}/features/${featureId}`, {
    method: "PATCH",
    body: { enabled },
  });
  return UserFeatureListSchema.element.parse(data);
}

export async function removeFeature(userId: string, featureId: string): Promise<void> {
  await apiRequest<void>(`/user/${userId}/features/${featureId}`, { method: "DELETE" });
}
