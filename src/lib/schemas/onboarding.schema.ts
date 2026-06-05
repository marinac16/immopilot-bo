import { z } from "zod";

// ─── Étapes manuelles (ne peuvent pas être déduites des données) ───────────────
export const OnboardingManualStepsSchema = z.object({
  notionWorkspaceReady:  z.boolean().default(false), // Workspace ImmoPilot Master dupliqué
  notionBasesShared:     z.boolean().default(false), // Bases partagées avec l'intégration Atelium Bot
  googleTestUserAdded:   z.boolean().default(false), // Ajouté comme utilisateur test sur GCP
  onboardingValidated:   z.boolean().default(false), // Test de bout en bout validé
});

// ─── Statut complet retourné par l'API ────────────────────────────────────────
export const OnboardingStatusSchema = z.object({
  userId: z.string(),
  steps: z.object({
    // PARTIE 1 — Notion
    notionWorkspaceReady:      z.boolean(), // Manuel : workspace ImmoPilot Master dupliqué
    notionIntegrationCreated:  z.boolean(), // Auto   : notionToken renseigné
    notionBasesShared:         z.boolean(), // Manuel : bases partagées avec Atelium Bot dans l'UI Notion
    notionDatabasesConnected:  z.boolean(), // Auto   : tous les IDs de bases renseignés
    // PARTIE 2 — Google Cloud
    googleTestUserAdded:       z.boolean(), // Manuel : ajouté comme utilisateur test sur GCP (avant Telegram !)
    // PARTIE 3 — Telegram + Google OAuth
    telegramConnected:         z.boolean(), // Auto   : telegramChatId renseigné (/start envoyé)
    googleConnected:           z.boolean(), // Auto   : OAuth Google complété via le bot
    gmailLabelsCreated:        z.boolean(), // Auto   : labels Gmail ImmoPilot créés
    // PARTIE 4 — Finalisation
    promptUpdated:             z.boolean(), // Auto   : promptAgentAjouterTache renseigné
    onboardingValidated:       z.boolean(), // Manuel : test de bout en bout validé
  }),
  progress: z.object({
    completed:   z.number(),
    total:       z.number(),
    percentage:  z.number(),
  }),
  isComplete: z.boolean(),
});

export const UpdateOnboardingManualStepsSchema = OnboardingManualStepsSchema.partial();

export type OnboardingStatus              = z.infer<typeof OnboardingStatusSchema>;
export type OnboardingManualSteps         = z.infer<typeof OnboardingManualStepsSchema>;
export type UpdateOnboardingManualStepsInput = z.infer<typeof UpdateOnboardingManualStepsSchema>;
