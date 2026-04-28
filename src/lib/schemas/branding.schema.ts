import { z } from "zod";

export const BrandingSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  emailHeaderUrl: z.string().url("URL invalide").nullable().optional(),
  emailFooterUrl: z.string().url("URL invalide").nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const UpdateBrandingSchema = z.object({
  emailHeaderUrl: z.string().url("URL invalide").optional(),
  emailFooterUrl: z.string().url("URL invalide").optional(),
});

export type Branding = z.infer<typeof BrandingSchema>;
export type UpdateBrandingInput = z.infer<typeof UpdateBrandingSchema>;
