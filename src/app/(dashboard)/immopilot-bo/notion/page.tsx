import { getUsers } from "@/lib/api/users";
import { getNotionConfig } from "@/lib/api/notion";
import { Header } from "@/components/layout/Header";
import { UserSelector } from "@/components/layout/UserSelector";
import { NotionForm } from "@/components/forms/NotionForm";
import { updateNotionAction } from "./actions";

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export default async function NotionPage({ searchParams }: Props) {
  const { userId } = await searchParams;
  const users = await getUsers();
  const selectedUser = userId ? users.find((u) => u.id === userId) : users[0];

  if (!selectedUser) {
    return (
      <div>
        <Header title="Notion" />
        <p className="text-muted text-sm">Aucun utilisateur disponible.</p>
      </div>
    );
  }

  const config = await getNotionConfig(selectedUser.id).catch(() => ({ userId: selectedUser.id, syncEnabled: false }));
  const boundAction = updateNotionAction.bind(null, selectedUser.id);

  return (
    <div>
      <Header
        title="Notion"
        actions={<UserSelector users={users} selectedUserId={selectedUser.id} />}
      />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <NotionForm action={boundAction} defaultValues={config} />
      </div>
    </div>
  );
}
