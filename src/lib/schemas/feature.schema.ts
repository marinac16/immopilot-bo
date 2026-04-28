import { z } from "zod";

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const UserFeatureSchema = z.object({
  id: z.string(),
  userId: z.string(),
  featureId: z.string(),
  enabled: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  feature: FeatureSchema,
});

export const FeatureListSchema = z.array(FeatureSchema);
export const UserFeatureListSchema = z.array(UserFeatureSchema);

export type Feature = z.infer<typeof FeatureSchema>;
export type UserFeature = z.infer<typeof UserFeatureSchema>;
