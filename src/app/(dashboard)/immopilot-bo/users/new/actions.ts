"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createUser } from "@/lib/api/users";
import { CreateUserSchema } from "@/lib/schemas/user.schema";

type State = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

export async function createUserAction(state: State, formData: FormData): Promise<State> {
  const raw = {
    email: formData.get("email"),
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    telegramChatId: formData.get("telegramChatId") || undefined,
    crmType: formData.get("crmType") || undefined,
  };

  const parsed = CreateUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const user = await createUser(parsed.data);
    revalidatePath("/immopilot-bo/users");
    redirect(`/immopilot-bo/users/${user.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de la création." };
  }
}
