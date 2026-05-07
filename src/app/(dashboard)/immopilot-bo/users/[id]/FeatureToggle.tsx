"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleFeatureAction } from "./features-actions";
import type { Feature, UserFeature } from "@/lib/schemas/feature.schema";

interface FeatureToggleProps {
  userId: string;
  feature: Feature;
  userFeature: UserFeature | undefined;
}

export function FeatureToggle({ userId, feature, userFeature }: FeatureToggleProps) {
  const [pending, startTransition] = useTransition();

  const isEnabled = userFeature?.enabled ?? false;

  function handleToggle() {
    startTransition(() => {
      toggleFeatureAction(userId, feature.id, userFeature?.id ?? null, isEnabled);
    });
  }

  return (
    <li className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium text-navy">{feature.name}</p>
        {feature.description && (
          <p className="text-xs text-muted mt-0.5">{feature.description}</p>
        )}
      </div>
      <Switch checked={isEnabled} onCheckedChange={handleToggle} disabled={pending} />
    </li>
  );
}
