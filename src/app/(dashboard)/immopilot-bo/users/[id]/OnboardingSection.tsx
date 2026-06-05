import { getOnboardingStatus } from "@/lib/api/onboarding";
import { ApiError } from "@/lib/api/client";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { toggleOnboardingStepAction } from "./onboarding-actions";

interface OnboardingSectionProps {
  userId: string;
}

export async function OnboardingSection({ userId }: OnboardingSectionProps) {
  const status = await getOnboardingStatus(userId).catch((err) => {
    // Endpoint pas encore déployé ou route inexistante
    if (err instanceof ApiError && (err.status === 404 || err.status === 500)) {
      return null;
    }
    throw err;
  });

  if (!status) {
    return (
      <div className="max-w-2xl bg-white rounded-xl border border-line p-6">
        <p className="text-sm font-semibold text-navy mb-1">Suivi d'onboarding</p>
        <p className="text-xs text-muted">
          L'endpoint API n'est pas encore disponible. Déploie{" "}
          <code className="font-mono bg-gray-100 px-1 rounded">
            GET /api/onboarding-status/:userId
          </code>{" "}
          dans <code className="font-mono bg-gray-100 px-1 rounded">immopilot-api</code> pour
          activer cette fonctionnalité.
        </p>
      </div>
    );
  }

  const boundToggle = toggleOnboardingStepAction.bind(null, userId);

  return <OnboardingChecklist userId={userId} status={status} onToggle={boundToggle} />;
}
