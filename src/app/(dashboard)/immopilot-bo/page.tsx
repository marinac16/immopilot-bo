import { getUsers } from "@/lib/api/users";
import { Header } from "@/components/layout/Header";
import { Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const users = await getUsers().catch(() => []);

  return (
    <div>
      <Header title="Vue d'ensemble" description="Tableau de bord ImmoPilot" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald/10">
              <Users className="h-5 w-5 text-emerald" />
            </div>
            <span className="text-sm font-medium text-muted">Utilisateurs</span>
          </div>
          <p className="text-3xl font-bold text-navy">{users.length}</p>
          <Link
            href="/immopilot-bo/users"
            className="text-xs text-emerald hover:underline mt-2 inline-block"
          >
            Voir tous →
          </Link>
        </div>
      </div>
    </div>
  );
}
