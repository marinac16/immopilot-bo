import { apiRequest, zparse } from "./client";
import {
  BrandingSchema,
  type Branding,
  type UpdateBrandingInput,
} from "@/lib/schemas/branding.schema";

export async function getBranding(userId: string): Promise<Branding> {
  const data = await apiRequest<unknown>(`/branding-config/${userId}`);
  return zparse(BrandingSchema, data);
}

export async function upsertBranding(userId: string, input: UpdateBrandingInput): Promise<Branding> {
  const data = await apiRequest<unknown>(`/branding-config/${userId}`, {
    method: "POST",
    body: input,
  });
  return zparse(BrandingSchema, data);
}
