import { z } from "zod";

export const StatusEnum = z.enum(["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"]);
export const CrmTypeEnum = z.enum(["sheets", "notion"]);

export const UserSchema = z.object({
  id: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  status: StatusEnum.optional(),
  telegramChatId: z.string().nullable().optional(),
  telegramBotToken: z.string().nullable().optional(),
  crmType: CrmTypeEnum.nullable().optional(),
  googleSpreadsheetId: z.string().nullable().optional(),
  gmailLabel: z.string().nullable().optional(),
  calendarId: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  lastSyncAt: z.string().datetime().nullable().optional(),
});

export const UserListResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
});

export const OAuthStatusSchema = z.object({
  user: z.object({
    id: z.string(),
    lastname: z.string(),
    firstname: z.string(),
    email: z.string(),
    status: z.string(),
  }),
  hasValidToken: z.boolean(),
});

export const CreateUserSchema = z.object({
  email: z.string().email("Email invalide"),
  firstname: z.string().optional(),
  lastname: z.string().min(1, "Nom requis"),
  telegramChatId: z.string().optional(),
  telegramBotToken: z.string().optional(),
  crmType: CrmTypeEnum.optional(),
  googleSpreadsheetId: z.string().optional(),
  gmailLabel: z.string().optional(),
  calendarId: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  email: z.string().email("Email invalide").optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  status: StatusEnum.optional(),
  telegramChatId: z.string().optional(),
  telegramBotToken: z.string().optional(),
  crmType: CrmTypeEnum.optional(),
  googleSpreadsheetId: z.string().optional(),
  gmailLabel: z.string().optional(),
  calendarId: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type OAuthStatus = z.infer<typeof OAuthStatusSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
