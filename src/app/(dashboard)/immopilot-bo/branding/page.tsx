import { getUsers } from "@/lib/api/users";
import { getBranding } from "@/lib/api/branding";
import { Header } from "@/components/layout/Header";
import { UserSelector } from "@/components/layout/UserSelector";
import { BrandingForm } from "@/components/forms/BrandingForm";
import { updateBrandingAction } from "./actions";

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export default async function BrandingPage({ searchParams }: Props) {
  const { userId } = await searchParams;
  const users = await getUsers();
  const selectedUser = userId ? users.find((u) => u.id === userId) : users[0];

  if (!selectedUser) {
    return (
      <div>
        <Header title="Branding" />
        <p className="text-muted text-sm">Aucun utilisateur disponible.</p>
      </div>
    );
  }

  const branding = await getBranding(selectedUser.id).catch(() => ({ userId: selectedUser.id }));
  const boundAction = updateBrandingAction.bind(null, selectedUser.id);

  return (
    <div>
      <Header
        title="Branding"
        actions={<UserSelector users={users} selectedUserId={selectedUser.id} />}
      />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <BrandingForm action={boundAction} defaultValues={branding} />
      </div>
    </div>
  );
}
