"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/lib/schemas/user.schema";

interface UserSelectorProps {
  users: User[];
  selectedUserId: string;
}

export function UserSelector({ users, selectedUserId }: UserSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = users.find((u) => u.id === selectedUserId);

  const filtered = users.filter((u) =>
    `${u.firstname ?? ""} ${u.lastname}`.toLowerCase().includes(search.toLowerCase().trim())
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSelect(userId: string) {
    router.push(`${pathname}?userId=${userId}`);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-navy outline-none hover:border-gray-300 focus:border-emerald focus:ring-1 focus:ring-emerald"
      >
        <span>
          {selected
            ? `${selected.firstname ?? ""} ${selected.lastname}`.trim()
            : "Choisir un utilisateur"}
        </span>
        <svg
          className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un utilisateur…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-emerald focus:ring-1 focus:ring-emerald"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">Aucun résultat</li>
            ) : (
              filtered.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(u.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      u.id === selectedUserId ? "font-semibold text-emerald" : "text-navy"
                    }`}
                  >
                    {u.firstname ?? ""} {u.lastname}
                    <span className="ml-2 text-xs text-muted">{u.email}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
