"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  ToggleLeft,
  Mail,
  Palette,
  FileText,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/immopilot-bo", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/immopilot-bo/users", label: "Utilisateurs", icon: Users },
  { href: "/immopilot-bo/features", label: "Feature flags", icon: ToggleLeft },
  { href: "/immopilot-bo/gmail-labels", label: "Labels Gmail", icon: Mail },
  { href: "/immopilot-bo/branding", label: "Branding", icon: Palette },
  { href: "/immopilot-bo/notion", label: "Notion", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-navy text-white">
      <div className="px-6 py-5 border-b border-navy-light">
        <span className="text-lg font-bold tracking-tight">ImmoPilot</span>
        <p className="text-xs text-muted mt-0.5">Backoffice admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/immopilot-bo" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-emerald text-white font-medium"
                  : "text-slate-300 hover:bg-navy-light hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-navy-light">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-navy-light hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
