import { apiRequest } from "./client";
import {
  BrandingSchema,
  type Branding,
  type UpdateBrandingInput,
} from "@/lib/schemas/branding.schema";

export async function getBranding(userId: string): Promise<Branding> {
  const data = await apiRequest<unknown>(`/branding-config/${userId}`);
  return BrandingSchema.parse(data);
}

export async function upsertBranding(userId: string, input: UpdateBrandingInput): Promise<Branding> {
  const data = await apiRequest<unknown>(`/branding-config/${userId}`, {
    method: "POST",
    body: input,
  });
  return BrandingSchema.parse(data);
}
