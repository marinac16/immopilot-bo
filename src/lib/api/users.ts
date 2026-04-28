import { apiRequest } from "./client";
import {
  UserSchema,
  UserListResponseSchema,
  OAuthStatusSchema,
  type User,
  type OAuthStatus,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/schemas/user.schema";

export async function getUsers(): Promise<User[]> {
  const data = await apiRequest<unknown>("/user");
  const parsed = UserListResponseSchema.parse(data);
  return parsed.users;
}

export async function getUser(id: string): Promise<User> {
  const data = await apiRequest<unknown>(`/user/${id}`);
  return UserSchema.parse(data);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const data = await apiRequest<unknown>("/user", { method: "POST", body: input });
  return UserSchema.parse(data);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const data = await apiRequest<unknown>(`/user/${id}`, { method: "PATCH", body: input });
  return UserSchema.parse(data);
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest<void>(`/user/${id}`, { method: "DELETE" });
}

export async function getGoogleAuthUrl(userId: string): Promise<string> {
  const data = await apiRequest<{ url: string }>("/auth/google", {
    params: { userId },
  });
  return data.url;
}

export async function getOAuthStatus(userId: string): Promise<OAuthStatus> {
  const data = await apiRequest<unknown>(`/auth/status/${userId}`);
  return OAuthStatusSchema.parse(data);
}
