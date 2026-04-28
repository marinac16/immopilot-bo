import { z } from "zod";

export const GmailLabelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["system", "user"]).optional(),
  messageListVisibility: z.string().optional(),
  labelListVisibility: z.string().optional(),
  color: z
    .object({
      textColor: z.string(),
      backgroundColor: z.string(),
    })
    .optional(),
});

export const GmailLabelListSchema = z.array(GmailLabelSchema);

export type GmailLabel = z.infer<typeof GmailLabelSchema>;
