"use client";

import { useState, useTransition } from "react";
import { syncNotionDatabasesAction, type SyncResult } from "./notion-actions";

interface Props {
  userId: string;
}

export function SyncNotionButton({ userId }: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncResult | null>(null);

  const handleSync = () => {
    setResult(null);
    startTransition(async () => {
      const res = await syncNotionDatabasesAction(userId);
      setResult(res);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Récupère automatiquement les IDs des bases et les prompts depuis le workspace Notion du client.
        </p>
        <button
          type="button"
          onClick={handleSync}
          disabled={pending}
          className="flex-shrink-0 ml-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Récupération…
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
                <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 1v4l2-2M8 5l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Récupérer les IDs
            </>
          )}
        </button>
      </div>

      {/* Résultat de la sync */}
      {result && !result.error && (
        <div className="rounded-lg border border-line bg-gray-50 p-3 space-y-2">
          {result.matched.length > 0 && (
            <div>
              <p className="text-xs font-medium text-navy mb-1.5">
                {result.matched.length} trouvé{result.matched.length > 1 ? "s" : ""} ✓
              </p>
              <ul className="space-y-1">
                {result.matched.map((item) => (
                  <li key={item.field} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-emerald-600">✓</span>
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted">←</span>
                    <span className="text-muted italic">{item.notionName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.notMatched.length > 0 && (
            <div className={result.matched.length > 0 ? "pt-2 border-t border-line" : ""}>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                {result.notMatched.length} non trouvé{result.notMatched.length > 1 ? "s" : ""}
              </p>
              <ul className="space-y-1">
                {result.notMatched.map((item) => (
                  <li key={item.field} className="flex items-center gap-2 text-xs text-gray-400">
                    <span>–</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
