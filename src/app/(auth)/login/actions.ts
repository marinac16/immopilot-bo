"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";

type State = { error: string } | undefined;

export async function loginAction(_state: State, formData: FormData): Promise<State> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.trim() === "") {
    return { error: "Mot de passe requis." };
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Mot de passe incorrect." };
  }

  await createSession();
  redirect("/immopilot-bo");
  return undefined;
}