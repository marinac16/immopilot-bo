import Link from "next/link";
import { cn } from "@/lib/utils";

export type UserTabId =
  | "informations"
  | "branding"
  | "notion"
  | "features"
  | "gmail-labels";

export interface UserTabDef {
  id: UserTabId;
  label: string;
  hidden?: boolean;
}

interface UserTabsProps {
  userId: string;
  active: UserTabId;
  tabs: UserTabDef[];
}

export function UserTabs({ userId, active, tabs }: UserTabsProps) {
  const visible = tabs.filter((t) => !t.hidden);

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Sections de l'utilisateur">
        {visible.map((tab) => {
          const isActive = tab.id === active;
          const href =
            tab.id === "informations"
              ? `/immopilot-bo/users/${userId}`
              : `/immopilot-bo/users/${userId}?tab=${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={href}
              scroll={false}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-emerald text-navy"
                  : "border-transparent text-muted hover:text-navy hover:border-gray-200"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function isValidTab(value: string | undefined): value is UserTabId {
  return (
    value === "informations" ||
    value === "branding" ||
    value === "notion" ||
    value === "features" ||
    value === "gmail-labels"
  );
}
