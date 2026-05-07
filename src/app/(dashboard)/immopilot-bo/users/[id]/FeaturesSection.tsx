import { getAllFeatures, getUserFeatures } from "@/lib/api/features";
import { FeatureToggle } from "./FeatureToggle";

interface FeaturesSectionProps {
  userId: string;
}

export async function FeaturesSection({ userId }: FeaturesSectionProps) {
  const [allFeatures, userFeatures] = await Promise.all([
    getAllFeatures(),
    getUserFeatures(userId),
  ]);

  const userFeatureMap = new Map(userFeatures.map((uf) => [uf.featureId, uf]));
  const enabledCount = userFeatures.filter((uf) => uf.enabled).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-baseline justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-navy">Feature flags</h2>
        <span className="text-xs text-muted">
          {enabledCount}/{allFeatures.length} active(s)
        </span>
      </div>
      {allFeatures.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-muted">Aucune feature disponible.</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {allFeatures.map((feature) => (
            <FeatureToggle
              key={feature.id}
              userId={userId}
              feature={feature}
              userFeature={userFeatureMap.get(feature.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
