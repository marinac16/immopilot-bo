import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/forms/UserForm";
import { createUserAction } from "./actions";
import Link from "next/link";

export default function NewUserPage() {
  return (
    <div>
      <Header
        title="Nouvel utilisateur"
        actions={
          <Button variant="outline" asChild>
            <Link href="/immopilot-bo/users">← Retour</Link>
          </Button>
        }
      />
      <div className="bg-white rounded-xl border border-line p-6 max-w-2xl">
        <UserForm action={createUserAction} submitLabel="Créer l'utilisateur" />
      </div>
    </div>
  );
}
