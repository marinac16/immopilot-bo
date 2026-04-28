import { getUsers } from "@/lib/api/users";
import { getGmailLabels } from "@/lib/api/gmail-labels";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export default async function GmailLabelsPage({ searchParams }: Props) {
  const { userId } = await searchParams;
  const users = await getUsers();
  const selectedUser = userId ? users.find((u) => u.id === userId) : users[0];

  if (!selectedUser) {
    return (
      <div>
        <Header title="Labels Gmail" />
        <p className="text-muted text-sm">Aucun utilisateur disponible.</p>
      </div>
    );
  }

  const labels = await getGmailLabels(selectedUser.id).catch(() => []);

  return (
    <div>
      <Header
        title="Labels Gmail"
        description={`${selectedUser.firstname} ${selectedUser.lastname} — ${labels.length} label(s)`}
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {labels.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted">
            Aucun label Gmail disponible. L'utilisateur doit d'abord connecter son compte Google.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {labels.map((label) => (
              <li key={label.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{label.name}</p>
                  <p className="text-xs text-muted">{label.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  {label.color && (
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: label.color.backgroundColor }}
                    />
                  )}
                  <Badge variant={label.type === "system" ? "default" : "success"}>
                    {label.type ?? "user"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
