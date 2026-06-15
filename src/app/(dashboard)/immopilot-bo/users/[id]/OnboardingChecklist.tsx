"use client";

import Link from "next/link";
import { useTransition } from "react";
import type { OnboardingStatus } from "@/lib/schemas/onboarding.schema";
import { SetupGmailLabelsButton } from "./SetupGmailLabelsButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type ManualStepKey =
  | "notionWorkspaceReady"
  | "notionIntegrationCreated"
  | "notionBasesShared"
  | "googleTestUserAdded"
  | "onboardingValidated";

interface StepDef {
  key: keyof OnboardingStatus["steps"];
  label: string;
  description: string;
  manual: boolean;
}

interface PartDef {
  number: string;
  label: string;
  steps: StepDef[];
}

// ─── Configuration des étapes ─────────────────────────────────────────────────

const PARTS: PartDef[] = [
  {
    number: "1",
    label: "Notion",
    steps: [
      {
        key: "notionWorkspaceReady",
        label: "Workspace ImmoPilot Master dupliqué",
        description: "Le client a dupliqué le template dans son propre workspace Notion.",
        manual: true,
      },
      {
        key: "notionIntegrationCreated",
        label: "Intégration Notion créée",
        description: "Token ntn_… créé sur notion.so/my-integrations et renseigné dans l'onglet Notion ci-dessus.",
        manual: true,
      },
      {
        key: "notionBasesShared",
        label: "Bases partagées avec l'intégration Atelium Bot",
        description: "Chaque base Notion a été connectée à l'intégration via ··· → Connections → Atelium Bot. Sans ça, l'API retourne une erreur 404.",
        manual: true,
      },
      {
        key: "notionDatabasesConnected",
        label: "IDs des bases renseignés",
        description:
          'Les 8 IDs de bases ont été détectés automatiquement via le bouton "Détecter les bases" dans l\'onglet Notion (Leads, Contacts, Visites, Biens, Relances, Équipe, Tâches, Templates).',
        manual: false,
      },
    ],
  },
  {
    number: "2",
    label: "Google Cloud",
    steps: [
      {
        key: "googleTestUserAdded",
        label: "Utilisateur test ajouté sur GCP",
        description: "L'email du client a été ajouté dans GCP → Écran de consentement OAuth → Utilisateurs test. À faire avant la connexion Telegram.",
        manual: true,
      },
    ],
  },
  {
    number: "3",
    label: "Telegram + Google OAuth",
    steps: [
      {
        key: "telegramConnected",
        label: "Client connecté au bot Alex",
        description: "Le client a envoyé /start à @Alex_ImmoPilot_bot avec son adresse mail. Telegram Chat ID renseigné automatiquement.",
        manual: false,
      },
      {
        key: "googleConnected",
        label: "Google OAuth complété via le bot",
        description: "Le client a cliqué sur le lien OAuth envoyé par le bot et autorisé l'accès à Gmail + Google Calendar.",
        manual: false,
      },
      {
        key: "gmailLabelsCreated",
        label: "Labels Gmail ImmoPilot créés",
        description: "Les labels de gestion des leads ont été créés dans le Gmail du client.",
        manual: false,
      },
    ],
  },
  {
    number: "4",
    label: "Finalisation",
    steps: [
      {
        key: "promptUpdated",
        label: "Prompt agent mis à jour",
        description: "Le prompt \"Ajouter une tâche\" a été personnalisé dans la config Notion du client.",
        manual: false,
      },
      {
        key: "onboardingValidated",
        label: "Test de bout en bout validé",
        description: "Le bot a été testé en conditions réelles : lead entrant, todo list, rappel calendar. Client passé en ACTIVE.",
        manual: true,
      },
    ],
  },
];

// ─── Sous-composants ──────────────────────────────────────────────────────────

function StepIcon({ completed }: { completed: boolean }) {
  if (completed) {
    return (
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 12 12">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-200 bg-white" />
  );
}

function AutoBadge() {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 leading-none">
      auto
    </span>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  userId: string;
  status: OnboardingStatus;
  onToggle: (
    step: ManualStepKey,
    value: boolean
  ) => Promise<{ error?: string; success?: boolean } | undefined>;
}

export function OnboardingChecklist({ userId, status, onToggle }: Props) {
  const [pending, startTransition] = useTransition();

  const handleToggle = (step: ManualStepKey, current: boolean) => {
    startTransition(async () => {
      await onToggle(step, !current);
    });
  };

  const { completed, total, percentage } = status.progress;

  return (
    <div className="space-y-4 max-w-2xl">

      {/* ── Header progress ── */}
      <div className="bg-white rounded-xl border border-line p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-navy">Progression de l'onboarding</h2>
            <p className="text-xs text-muted mt-0.5">
              {completed} / {total} étapes complètes
            </p>
          </div>
          {status.isComplete ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Onboarding terminé
            </span>
          ) : (
            <span className="text-xs font-semibold text-navy tabular-nums">
              {percentage}%
            </span>
          )}
        </div>

        {/* Barre de progression */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* ── Étapes par partie ── */}
      {PARTS.map((part) => {
        const partSteps = part.steps;
        const partCompleted = partSteps.filter((s) => status.steps[s.key]).length;
        const partDone = partCompleted === partSteps.length;

        return (
          <div key={part.label} className="bg-white rounded-xl border border-line p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">
                Partie {part.number} — {part.label}
              </h3>
              <span className={`text-xs font-medium tabular-nums ${partDone ? "text-emerald-600" : "text-gray-400"}`}>
                {partCompleted}/{partSteps.length}
              </span>
            </div>

            <div className="space-y-4">
              {partSteps.map((step) => {
                const isCompleted = status.steps[step.key];

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <StepIcon completed={isCompleted} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-medium ${isCompleted ? "text-navy" : "text-gray-500"}`}>
                          {step.label}
                        </span>
                        {!step.manual && <AutoBadge />}
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{step.description}</p>

                      {step.key === "notionDatabasesConnected" && !isCompleted && (
                        <div className="mt-2 space-y-2">
                          <div className="rounded-lg bg-gray-50 border border-line px-3 py-2 text-xs text-gray-600 leading-relaxed">
                            <ol className="list-decimal list-inside space-y-0.5">
                              <li>Renseigne le token Notion (ntn_…)</li>
                              <li>Colle l&apos;URL de la page ImmoPilot Master du client</li>
                              <li>Clique sur &quot;Détecter les bases&quot;</li>
                              <li>Vérifie le mapping et enregistre</li>
                            </ol>
                          </div>
                          <Link
                            href={`/immopilot-bo/users/${userId}?tab=notion`}
                            scroll={false}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-line bg-white text-navy hover:bg-gray-50 hover:border-gray-300 transition-all group"
                          >
                            <span aria-hidden>⚙️</span>
                            <span>Configurer dans l&apos;onglet Notion</span>
                            <svg
                              className="w-3 h-3 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-navy"
                              fill="none"
                              viewBox="0 0 16 16"
                              aria-hidden
                            >
                              <path
                                d="M6 4l4 4-4 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Bouton toggle pour les étapes manuelles */}
                    {step.manual && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleToggle(step.key as ManualStepKey, isCompleted)}
                        className={`
                          flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                          ${isCompleted
                            ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            : "border-line text-gray-600 bg-white hover:bg-gray-50"
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {isCompleted ? "Fait ✓" : "Marquer fait"}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Bouton Gmail labels — Partie 3, Google connecté mais labels pas encore créés */}
              {part.number === "3" && status.steps.googleConnected && !status.steps.gmailLabelsCreated && (
                <div className="pt-3 border-t border-line flex justify-end">
                  <SetupGmailLabelsButton userId={userId} compact />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
