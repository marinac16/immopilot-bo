import { getBranding } from "@/lib/api/branding";
import { BrandingForm } from "@/components/forms/BrandingForm";
import { updateBrandingAction } from "./branding-actions";

interface BrandingSectionProps {
  userId: string;
}

export async function BrandingSection({ userId }: BrandingSectionProps) {
  const branding = await getBranding(userId).catch(() => ({ userId }));
  const boundAction = updateBrandingAction.bind(null, userId);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-sm font-semibold text-navy">Branding</h2>
        <span className="text-xs text-muted">propre à cet utilisateur</span>
      </div>
      <p className="text-xs text-muted mb-4">
        Visuels d&apos;en-tête et de pied de page injectés dans les emails envoyés.
      </p>
      <BrandingForm action={boundAction} defaultValues={branding} />
    </div>
  );
}
