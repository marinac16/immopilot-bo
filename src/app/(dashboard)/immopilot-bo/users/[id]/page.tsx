import { Suspense } from "react";
import { getUser, getOAuthStatus } from "@/lib/api/users";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionSkeleton, ListSkeleton } from "@/components/ui/skeleton";
import { UserForm } from "@/components/forms/UserForm";
import { UserTabs, isValidTab, type UserTabId } from "./UserTabs";
import { NotionConfigSection } from "./NotionConfigSection";
import { BrandingSection } from "./BrandingSection";
import { FeaturesSection } from "./FeaturesSection";
import { GmailLabelsSection } from "./GmailLabelsSection";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { updateUserAction, deleteUserAction } from "./actions";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function UserDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;

  const [user, oauthStatus] = await Promise.all([
    getUser(id),
    getOAuthStatus(id).catch(() => null),
  ]);

  const isNotionUser = user.crmType === "notion";
  const requestedTab: UserTabId = isValidTab(tab) ? tab : "informations";
  const activeTab: UserTabId =
    requestedTab === "notion" && !isNotionUser ? "informations" : requestedTab;

  const boundUpdate = updateUserAction.bind(null, id);
  const boundDelete = deleteUserAction.bind(null, id);

  return (
    <div>
      <Header
        title={`${user.firstname ?? ""} ${user.lastname}`.trim() || "Utilisateur"}
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

      <UserTabs
        userId={id}
        active={activeTab}
        tabs={[
          { id: "informations", label: "Informations" },
          { id: "branding", label: "Branding" },
          { id: "notion", label: "Notion", hidden: !isNotionUser },
          { id: "features", label: "Feature flags" },
          { id: "gmail-labels", label: "Labels Gmail" },
        ]}
      />

      {activeTab === "informations" && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-line p-6">
            <h2 className="text-sm font-semibold text-navy mb-4">Informations</h2>
            <UserForm action={boundUpdate} defaultValues={user} />
          </div>

          <div className="bg-white rounded-xl border border-red-200 p-6">
            <h2 className="text-sm font-semibold text-red-600 mb-1">Zone de danger</h2>
            <p className="text-xs text-muted mb-4">
              La suppression est irréversible. Une confirmation par email te sera demandée.
            </p>
            <DeleteUserDialog
              user={{
                firstname: user.firstname ?? null,
                lastname: user.lastname,
                email: user.email,
              }}
              action={boundDelete}
            />
          </div>
        </div>
      )}

      {activeTab === "branding" && (
        <div className="max-w-2xl">
          <Suspense fallback={<SectionSkeleton title="Branding" rows={2} />}>
            <BrandingSection userId={id} />
          </Suspense>
        </div>
      )}

      {activeTab === "notion" && isNotionUser && (
        <div className="max-w-2xl">
          <Suspense fallback={<SectionSkeleton title="Configuration Notion" rows={6} />}>
            <NotionConfigSection userId={id} />
          </Suspense>
        </div>
      )}

      {activeTab === "features" && (
        <div className="max-w-2xl">
          <Suspense fallback={<ListSkeleton rows={4} />}>
            <FeaturesSection userId={id} />
          </Suspense>
        </div>
      )}

      {activeTab === "gmail-labels" && (
        <div className="max-w-2xl">
          <Suspense fallback={<ListSkeleton rows={6} />}>
            <GmailLabelsSection userId={id} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
