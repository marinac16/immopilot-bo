"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateUser, deleteUser } from "@/lib/api/users";
import { UpdateUserSchema } from "@/lib/schemas/user.schema";

type State =
  | { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean }
  | undefined;

export async function updateUserAction(
  userId: string,
  _state: State,
  formData: FormData
): Promise<State> {
  const raw = {
    email: formData.get("email") || undefined,
    firstname: formData.get("firstname") || undefined,
    lastname: formData.get("lastname") || undefined,
    status: formData.get("status") || undefined,
    telegramChatId: formData.get("telegramChatId") || undefined,
    crmType: formData.get("crmType") || undefined,
    googleSpreadsheetId: formData.get("googleSpreadsheetId") || undefined,
    gmailLabel: formData.get("gmailLabel") || undefined,
    calendarId: formData.get("calendarId") || undefined,
  };

  const parsed = UpdateUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateUser(userId, parsed.data);
    revalidatePath(`/immopilot-bo/users/${userId}`);
    revalidatePath("/immopilot-bo/users");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de la mise à jour." };
  }
}

export async function deleteUserAction(userId: string): Promise<void> {
  await deleteUser(userId);
  revalidatePath("/immopilot-bo/users");
  redirect("/immopilot-bo/users");
}
