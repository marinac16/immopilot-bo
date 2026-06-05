import { getGmailLabels } from "@/lib/api/gmail-labels";
import { Badge } from "@/components/ui/badge";
import { SetupGmailLabelsButton } from "./SetupGmailLabelsButton";

interface GmailLabelsSectionProps {
  userId: string;
}

export async function GmailLabelsSection({ userId }: GmailLabelsSectionProps) {
  const labels = await getGmailLabels(userId).catch(() => null);
  const googleConnected = labels !== null;

  return (
    <div className="bg-white rounded-xl border border-line overflow-hidden">
      <div className="flex items-baseline justify-between px-6 py-4 border-b border-line">
        <div>
          <h2 className="text-sm font-semibold text-navy">Labels Gmail</h2>
          <p className="text-xs text-muted mt-0.5">
            Référence pour configurer le champ <strong>Gmail Label</strong> dans Informations.
          </p>
        </div>
        {labels && (
          <span className="text-xs text-muted">{labels.length} label(s)</span>
        )}
      </div>

      {!googleConnected ? (
        <p className="px-6 py-8 text-center text-sm text-muted">
          Impossible de récupérer les labels. L&apos;utilisateur doit d&apos;abord connecter son compte Google.
        </p>
      ) : labels.length === 0 ? (
        <>
          <p className="px-6 py-8 text-center text-sm text-muted">Aucun label Gmail disponible.</p>
          <SetupGmailLabelsButton userId={userId} />
        </>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {labels.map((label) => (
              <li key={label.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{label.name}</p>
                  <p className="text-xs text-muted font-mono">{label.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  {label.color && (
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-line"
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
          <SetupGmailLabelsButton userId={userId} />
        </>
      )}
    </div>
  );
}
