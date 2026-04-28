import { z } from "zod";

export const NotionConfigSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  notionToken: z.string().nullable().optional(),
  leadsAcquereurs: z.string().nullable().optional(),
  visites: z.string().nullable().optional(),
  biens: z.string().nullable().optional(),
  relances: z.string().nullable().optional(),
  equipe: z.string().nullable().optional(),
  contacts: z.string().nullable().optional(),
  taches: z.string().nullable().optional(),
  templateMessages: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const UpdateNotionConfigSchema = NotionConfigSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true }).partial();

export type NotionConfig = z.infer<typeof NotionConfigSchema>;
export type UpdateNotionConfigInput = z.infer<typeof UpdateNotionConfigSchema>;
