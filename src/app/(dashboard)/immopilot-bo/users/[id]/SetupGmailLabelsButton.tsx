"use client";

import { useState, useTransition } from "react";
import { setupGmailLabelsAction, type SetupLabelsResult } from "./gmail-labels-actions";

interface Props {
  userId: string;
  compact?: boolean; // masque la description — pour usage dans la checklist onboarding
}

export function SetupGmailLabelsButton({ userId, compact = false }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SetupLabelsResult | null>(null);

  const handleSetup = () => {
    setResult(null);
    startTransition(async () => {
      const res = await setupGmailLabelsAction(userId);
      setResult(res);
    });
  };

  return (
    <div className={compact ? "space-y-2" : "px-6 py-4 border-t border-line space-y-3"}>
      <div className={compact ? undefined : "flex items-center justify-between"}>
        {!compact && (
          <p className="text-xs text-muted">
            Crée les labels ImmoPilot dans Gmail du client s'ils n'existent pas encore.
          </p>
        )}
        <button
          type="button"
          onClick={handleSetup}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors${compact ? "" : " flex-shrink-0 ml-4"}`}
        >
          {pending ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Création…
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Créer les labels ImmoPilot
            </>
          )}
        </button>
      </div>

      {result?.labels && result.labels.length > 0 && (
        <div className="rounded-lg border border-line bg-gray-50 p-3">
          <p className="text-xs font-medium text-navy mb-1.5">
            {result.labels.length} label{result.labels.length > 1 ? "s" : ""} configuré{result.labels.length > 1 ? "s" : ""} ✓
          </p>
          <ul className="space-y-1">
            {result.labels.map((label) => (
              <li key={label.id} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-emerald-600">✓</span>
                <span className="font-medium">{label.name}</span>
                <span className="text-muted font-mono text-[10px]">{label.id}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {result.error}
        </p>
      )}
    </div>
  );
}
