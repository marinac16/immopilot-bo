import { getUser, getOAuthStatus } from "@/lib/api/users";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/components/forms/UserForm";
import { updateUserAction, deleteUserAction } from "./actions";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const [user, oauthStatus] = await Promise.all([
    getUser(id),
    getOAuthStatus(id).catch(() => null),
  ]);

  const boundUpdate = updateUserAction.bind(null, id);
  const boundDelete = deleteUserAction.bind(null, id);

  return (
    <div>
      <Header
        title={`${user.firstname} ${user.lastname}`}
        description={user.email}
        actions={
          <div className="flex gap-2">
            <Badge variant={oauthStatus?.hasValidToken ? "success" : "default"}>
              {oauthStatus?.hasValidToken ? "Google connecté" : "Google non connecté"}
            </Badge>
            <Button variant="outline" asChild>
              <Link href="/immopilot-bo/users">← Retour</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-navy mb-4">Informations</h2>
          <UserForm action={boundUpdate} defaultValues={user} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-navy mb-3">Liens rapides</h2>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/immopilot-bo/features?userId=${id}`}>Features</Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/immopilot-bo/gmail-labels?userId=${id}`}>Labels Gmail</Link>
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-red-50 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-red-600 mb-3">Zone de danger</h2>
            <form action={boundDelete}>
              <Button variant="destructive" size="sm" type="submit">
                Supprimer l'utilisateur
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
