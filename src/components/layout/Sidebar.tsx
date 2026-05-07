"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, LayoutDashboard, LogOut } from "lucide-react";

const navItems = [
  { href: "/immopilot-bo", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/immopilot-bo/users", label: "Utilisateurs", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-surface border-r border-line">
      <div className="px-5 py-5">
        <span className="text-base font-semibold tracking-tight text-navy">ImmoPilot</span>
        <p className="text-xs text-muted mt-0.5">Backoffice</p>
      </div>

      <nav className="flex-1 px-2 py-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/immopilot-bo" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-emerald/10 text-emerald font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-navy"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-line">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-navy transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
