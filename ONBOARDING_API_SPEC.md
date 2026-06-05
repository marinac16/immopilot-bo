# Spec API — Onboarding Status

À implémenter dans `immopilot-api` (Express + Prisma).

---

## Prompt Claude Code

> Copier-coller ce prompt dans Claude Code depuis la racine du projet `immopilot-api`.

```
Implémente le suivi du statut d'onboarding client dans cette API Express/Prisma/TypeScript.

**Contexte**
L'API expose des routes sous /api/* sécurisées par X-API-Key. Chaque client (mandataire immobilier)
a un User, un NotionConfig (IDs de bases Notion), et potentiellement un token OAuth Google.
L'onboarding d'un nouveau client comporte 9 étapes réparties en 4 parties, dont 4 sont "manuelles"
(ne peuvent pas être déduites des données existantes).

Le BO dispose déjà d'un bouton "Récupérer les IDs" qui appelle l'API Notion avec le token du client
et auto-remplit 7 IDs de bases + l'ID de la page prompt dans NotionConfig. Ce bouton fait appel
aux endpoints existants PUT /api/notion-config/:userId. L'API n'a donc pas à gérer cette logique.

**Modèle de données NotionConfig existant (pour référence) :**
- notionToken      : token d'intégration interne Notion (ntn_…)
- leadsAcquereurs  : ID base "Leads Acquéreurs"
- visites          : ID base "Visites"
- biens            : ID base "Biens (Mandats)"
- relances         : ID base "Relances"
- equipe           : ID base "Équipe"
- contacts         : ID base "Contacts"
- templateMessages : ID base "Config templates messages"
- taches           : ID non rempli automatiquement (ToDoList est une page Notion, pas une base)
- promptAgentAjouterTache : ID de la page "Prompt - Agent ajouter tâche" (auto-rempli par le sync)

**Ce qu'il faut faire**

1. Ajouter ce modèle Prisma dans schema.prisma :

model OnboardingStatus {
  id                   String   @id @default(uuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  // Étapes manuelles (ne peuvent pas être déduites des données)
  notionWorkspaceReady Boolean  @default(false)  // Workspace ImmoPilot Master dupliqué
  notionBasesShared    Boolean  @default(false)  // Bases partagées avec Atelium Bot dans l'UI Notion
  googleTestUserAdded  Boolean  @default(false)  // Utilisateur test ajouté sur Google Cloud Console
  onboardingValidated  Boolean  @default(false)  // Test de bout en bout validé
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

Ajouter aussi `onboardingStatus OnboardingStatus?` dans le modèle User existant.
Puis lancer : `npx prisma migrate dev --name add_onboarding_status`

2. Créer src/routes/onboarding-status.ts avec deux endpoints :

GET /api/onboarding-status/:userId
Calcule et retourne les 9 étapes dans cet ordre précis :

PARTIE 1 — Notion
- notionWorkspaceReady     : OnboardingStatus.notionWorkspaceReady (manuel)
- notionIntegrationCreated : NotionConfig.notionToken != null (détecté)
- notionBasesShared        : OnboardingStatus.notionBasesShared (manuel)
- notionDatabasesConnected : les 7 IDs auto-remplissables sont tous != null et non vides :
    leadsAcquereurs, visites, biens, relances, equipe, contacts, templateMessages
    ⚠️ NE PAS inclure `taches` dans ce check (ToDoList est une page Notion, pas une base —
    ce champ ne sera jamais auto-rempli par le sync)

PARTIE 2 — Google Cloud (doit être fait AVANT Telegram)
- googleTestUserAdded      : OnboardingStatus.googleTestUserAdded (manuel)

PARTIE 3 — Telegram + Google OAuth
  (le bot Telegram envoie le lien OAuth Google dès que le client envoie /start)
- telegramConnected        : User.telegramChatId != null (détecté)
- googleConnected          : token OAuth valide pour cet userId (détecté — adapter selon le modèle)

PARTIE 4 — Finalisation
- promptUpdated            : NotionConfig.promptAgentAjouterTache != null (détecté)
  (l'ID de la page prompt est auto-rempli par le même bouton sync que les bases Notion)
- onboardingValidated      : OnboardingStatus.onboardingValidated (manuel)

Format de réponse (enveloppé dans { success: true, data: ... }) :
{
  userId: string,
  steps: {
    notionWorkspaceReady: boolean,
    notionIntegrationCreated: boolean,
    notionBasesShared: boolean,
    notionDatabasesConnected: boolean,
    googleTestUserAdded: boolean,
    telegramConnected: boolean,
    googleConnected: boolean,
    promptUpdated: boolean,
    onboardingValidated: boolean
  },
  progress: { completed: number, total: 9, percentage: number },
  isComplete: boolean
}

PATCH /api/onboarding-status/:userId
- Body : { notionWorkspaceReady?: boolean, notionBasesShared?: boolean, googleTestUserAdded?: boolean, onboardingValidated?: boolean }
- Tous les champs sont optionnels
- Upsert dans OnboardingStatus
- Retourne le même format que le GET (statut recalculé)

3. Enregistrer la route dans le fichier principal :
   app.use("/api/onboarding-status", onboardingStatusRouter)

4. Respecter les patterns existants : gestion d'erreurs, middleware auth X-API-Key,
   format { success, data/error }, typage TypeScript strict.

5. Si des tests d'intégration existent pour d'autres routes, ajouter un fichier de test
   équivalent pour ces deux nouveaux endpoints.
```

---

## 1. Modèle Prisma

```prisma
model OnboardingStatus {
  id                   String   @id @default(uuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Étapes manuelles
  notionWorkspaceReady Boolean  @default(false)
  notionBasesShared    Boolean  @default(false)
  googleTestUserAdded  Boolean  @default(false)
  onboardingValidated  Boolean  @default(false)

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

Relation à ajouter dans `User` :
```prisma
onboardingStatus OnboardingStatus?
```

Migration : `npx prisma migrate dev --name add_onboarding_status`

---

## 2. Les 9 étapes (ordre et logique)

| # | Étape | Partie | Type | Source | Description |
|---|-------|--------|------|--------|-------------|
| 1 | notionWorkspaceReady | 1 — Notion | Manuel | OnboardingStatus.notionWorkspaceReady | Le client a dupliqué le template ImmoPilot Master dans son propre workspace Notion |
| 2 | notionIntegrationCreated | 1 — Notion | Détecté | NotionConfig.notionToken != null | Le client a créé une intégration interne sur notion.so/my-integrations (type Internal, permissions Read/Update/Insert) et le token ntn_… a été renseigné dans la config |
| 3 | notionBasesShared | 1 — Notion | Manuel | OnboardingStatus.notionBasesShared | Le client a ouvert chaque base Notion → ··· → Connections → Atelium Bot. Sans cette étape l'API Notion retourne une erreur 404 |
| 4 | notionDatabasesConnected | 1 — Notion | Détecté | 7 IDs NotionConfig != null | Les 7 IDs auto-remplissables ont été récupérés via le bouton sync du BO (Leads, Visites, Biens, Relances, Équipe, Contacts, Templates). `taches` est exclu car ToDoList est une page Notion, pas une base |
| 5 | googleTestUserAdded | 2 — Google Cloud | Manuel | OnboardingStatus.googleTestUserAdded | L'email du client a été ajouté dans GCP → Écran de consentement OAuth → Utilisateurs test. À faire impérativement avant l'étape Telegram |
| 6 | telegramConnected | 3 — Telegram + Google | Détecté | User.telegramChatId != null | Le client a envoyé /start à @Alex_ImmoPilot_bot avec son adresse email. Le bot a enregistré son Chat ID et envoyé immédiatement le lien OAuth Google |
| 7 | googleConnected | 3 — Telegram + Google | Détecté | Token OAuth valide | Le client a cliqué sur le lien OAuth reçu dans Telegram et autorisé l'accès à Gmail + Google Calendar |
| 8 | promptUpdated | 4 — Finalisation | Détecté | NotionConfig.promptAgentAjouterTache != null | L'ID de la page "Prompt - Agent ajouter tâche" a été récupéré automatiquement par le bouton sync (même action que les bases Notion) |
| 9 | onboardingValidated | 4 — Finalisation | Manuel | OnboardingStatus.onboardingValidated | Test de bout en bout effectué : lead entrant traité, todo list générée, rappel calendar créé. Client passé en statut ACTIVE |

> ⚠️ L'étape 5 (googleTestUserAdded) doit être faite par Marina **avant** que le client envoie
> `/start` sur Telegram (étape 6), car le bot envoie immédiatement le lien OAuth Google.

**Logique notionDatabasesConnected (7 IDs, `taches` exclu) :**
```ts
const sevenIds = [
  notionConfig?.leadsAcquereurs,
  notionConfig?.visites,
  notionConfig?.biens,
  notionConfig?.relances,
  notionConfig?.equipe,
  notionConfig?.contacts,
  notionConfig?.templateMessages,
  // taches intentionnellement exclu : ToDoList est une page Notion, pas une base
];
const notionDatabasesConnected = !!notionConfig && sevenIds.every((id) => id != null && id.trim() !== "");
```

---

## 3. Ce que fait le BO (pour info, pas à implémenter dans l'API)

Le bouton **"Récupérer les IDs"** dans l'onglet Notion du BO effectue deux appels Notion en parallèle avec le token du client :
- `POST https://api.notion.com/v1/search` avec `filter: database` → mappe 7 IDs de bases via matching flexible sur les noms
- `POST https://api.notion.com/v1/search` avec `filter: page` + `query: "Prompt"` → récupère l'ID de la page "Prompt - Agent ajouter tâche"

Il sauvegarde ensuite via `PUT /api/notion-config/:userId` (endpoint existant).
Résultat : `notionDatabasesConnected` et `promptUpdated` passent au vert automatiquement dès le clic.

---

## 4. Endpoints

### `GET /api/onboarding-status/:userId`

```ts
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const [user, notionConfig, manualSteps, oauthToken] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.notionConfig.findUnique({ where: { userId } }),
    prisma.onboardingStatus.findUnique({ where: { userId } }),
    prisma.oAuthToken.findFirst({ where: { userId } }), // adapter selon ton modèle
  ]);

  if (!user) return res.status(404).json({ success: false, error: "User not found" });

  const sevenIds = [
    notionConfig?.leadsAcquereurs,
    notionConfig?.visites,
    notionConfig?.biens,
    notionConfig?.relances,
    notionConfig?.equipe,
    notionConfig?.contacts,
    notionConfig?.templateMessages,
    // taches exclu intentionnellement
  ];

  const steps = {
    notionWorkspaceReady:     manualSteps?.notionWorkspaceReady ?? false,
    notionIntegrationCreated: !!notionConfig?.notionToken,
    notionBasesShared:        manualSteps?.notionBasesShared ?? false,
    notionDatabasesConnected: !!notionConfig && sevenIds.every((id) => id != null && id.trim() !== ""),
    googleTestUserAdded:      manualSteps?.googleTestUserAdded ?? false,
    telegramConnected:        !!user.telegramChatId,
    googleConnected:          !!oauthToken,
    promptUpdated:            !!notionConfig?.promptAgentAjouterTache,
    onboardingValidated:      manualSteps?.onboardingValidated ?? false,
  };

  const completed = Object.values(steps).filter(Boolean).length;
  const total = 9;

  return res.json({
    success: true,
    data: {
      userId,
      steps,
      progress: { completed, total, percentage: Math.round((completed / total) * 100) },
      isComplete: completed === total,
    },
  });
});
```

### `PATCH /api/onboarding-status/:userId`

```ts
router.patch("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { notionWorkspaceReady, notionBasesShared, googleTestUserAdded, onboardingValidated } = req.body;

  await prisma.onboardingStatus.upsert({
    where: { userId },
    create: {
      userId,
      ...(notionWorkspaceReady !== undefined && { notionWorkspaceReady }),
      ...(notionBasesShared    !== undefined && { notionBasesShared }),
      ...(googleTestUserAdded  !== undefined && { googleTestUserAdded }),
      ...(onboardingValidated  !== undefined && { onboardingValidated }),
    },
    update: {
      ...(notionWorkspaceReady !== undefined && { notionWorkspaceReady }),
      ...(notionBasesShared    !== undefined && { notionBasesShared }),
      ...(googleTestUserAdded  !== undefined && { googleTestUserAdded }),
      ...(onboardingValidated  !== undefined && { onboardingValidated }),
    },
  });

  // Retourner le statut recalculé (réutiliser le handler GET)
  return handleGetOnboardingStatus(req, res);
});
```

---

## 5. Checklist d'intégration

- [ ] Ajouter le modèle `OnboardingStatus` dans `schema.prisma` + relation sur `User`
- [ ] Lancer `npx prisma migrate dev --name add_onboarding_status`
- [ ] Créer `src/routes/onboarding-status.ts`
- [ ] Enregistrer dans `app.ts` : `app.use("/api/onboarding-status", onboardingStatusRouter)`
- [ ] Adapter le nom du modèle OAuth tokens selon le schéma Prisma existant
- [ ] Ajouter les tests d'intégration
- [ ] Tester les deux endpoints avec curl ou Postman
