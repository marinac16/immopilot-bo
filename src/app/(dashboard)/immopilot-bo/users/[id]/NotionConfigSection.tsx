import { getNotionConfig } from "@/lib/api/notion";
import { NotionForm } from "@/components/forms/NotionForm";
import { updateNotionAction } from "./notion-actions";

interface NotionConfigSectionProps {
  userId: string;
}

export async function NotionConfigSection({ userId }: NotionConfigSectionProps) {
  const config = await getNotionConfig(userId).catch(() => ({
    userId,
    syncEnabled: false,
  }));
  const boundAction = updateNotionAction.bind(null, userId);

  return (
    <div className="bg-white rounded-xl border border-line p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-sm font-semibold text-navy">Configuration Notion</h2>
        <span className="text-xs text-muted">propre à cet utilisateur</span>
      </div>
      <p className="text-xs text-muted mb-4">
        Token et identifiants des bases Notion utilisés pour synchroniser les données.
      </p>
      <NotionForm action={boundAction} defaultValues={config} />
    </div>
  );
}
