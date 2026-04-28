import { getUsers } from "@/lib/api/users";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import { userColumns } from "./columns";
import Link from "next/link";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <Header
        title="Utilisateurs"
        description={`${users.length} mandataire(s) enregistré(s)`}
        actions={
          <Button asChild>
            <Link href="/immopilot-bo/users/new">+ Nouveau</Link>
          </Button>
        }
      />
      <DataTable columns={userColumns} data={users} searchKey="email" searchPlaceholder="Rechercher par email…" />
    </div>
  );
}
