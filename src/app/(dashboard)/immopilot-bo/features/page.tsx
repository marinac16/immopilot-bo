import { getUsers } from "@/lib/api/users";
import { getAllFeatures, getUserFeatures } from "@/lib/api/features";
import { Header } from "@/components/layout/Header";
import { FeatureToggle } from "./FeatureToggle";

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export default async function FeaturesPage({ searchParams }: Props) {
  const { userId } = await searchParams;
  const users = await getUsers();
  const selectedUser = userId ? users.find((u) => u.id === userId) : users[0];

  if (!selectedUser) {
    return (
      <div>
        <Header title="Features" />
        <p className="text-muted text-sm">Aucun utilisateur disponible.</p>
      </div>
    );
  }

  const [allFeatures, userFeatures] = await Promise.all([
    getAllFeatures(),
    getUserFeatures(selectedUser.id),
  ]);

  const userFeatureMap = new Map(userFeatures.map((uf) => [uf.featureId, uf]));
  const enabledCount = userFeatures.filter((uf) => uf.enabled).length;

  return (
    <div>
      <Header
        title="Features"
        description={`${selectedUser.firstname} ${selectedUser.lastname} — ${enabledCount}/${allFeatures.length} active(s)`}
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-lg">
        <ul className="divide-y divide-gray-50">
          {allFeatures.map((feature) => (
            <FeatureToggle
              key={feature.id}
              userId={selectedUser.id}
              feature={feature}
              userFeature={userFeatureMap.get(feature.id)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
