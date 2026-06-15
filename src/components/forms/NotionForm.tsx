"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/lib/toast";
import { parseNotionPageId } from "@/lib/notion-utils";
import type { NotionConfig } from "@/lib/schemas/notion.schema";
import { detectNotionDatabases } from "@/app/(dashboard)/immopilot-bo/users/[id]/notion-actions";

type FormState = { error?: string; success?: boolean } | undefined;

type DbFieldKey =
  | "leadsAcquereurs"
  | "visites"
  | "biens"
  | "relances"
  | "equipe"
  | "contacts"
  | "taches"
  | "templateMessages";

interface NotionFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: Partial<NotionConfig>;
}

const DB_FIELDS: { name: DbFieldKey; label: string }[] = [
  { name: "leadsAcquereurs", label: "DB — Leads acquéreurs" },
  { name: "visites", label: "DB — Visites" },
  { name: "biens", label: "DB — Biens" },
  { name: "relances", label: "DB — Relances" },
  { name: "equipe", label: "DB — Équipe" },
  { name: "contacts", label: "DB — Contacts" },
  { name: "taches", label: "DB — Tâches" },
  { name: "templateMessages", label: "DB — Template messages" },
];

function matchDatabaseToField(title: string): DbFieldKey | null {
  if (/lead/i.test(title) || /acquér/i.test(title) || /acquer/i.test(title)) return "leadsAcquereurs";
  if (/bien/i.test(title)) return "biens";
  if (/visite/i.test(title)) return "visites";
  if (/contact/i.test(title)) return "contacts";
  if (/tache/i.test(title) || /tâche/i.test(title)) return "taches";
  if (/relance/i.test(title)) return "relances";
  if (/equipe/i.test(title) || /équipe/i.test(title)) return "equipe";
  if (/template/i.test(title) || /config/i.test(title)) return "templateMessages";
  return null;
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function NotionForm({ action, defaultValues }: NotionFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const [detecting, startDetect] = useTransition();

  const [tokenValue, setTokenValue] = useState(defaultValues?.notionToken ?? "");
  const [parentPageValue, setParentPageValue] = useState(defaultValues?.notionParentPageId ?? "");
  const [dbValues, setDbValues] = useState<Record<DbFieldKey, string>>(() =>
    Object.fromEntries(
      DB_FIELDS.map(({ name }) => [name, (defaultValues?.[name] as string | null | undefined) ?? ""])
    ) as Record<DbFieldKey, string>
  );
  const [autoDetected, setAutoDetected] = useState<Set<DbFieldKey>>(new Set());
  const [detectionDone, setDetectionDone] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const canDetect =
    tokenValue.trim().startsWith("ntn_") && parentPageValue.trim().length > 0;

  useEffect(() => {
    if (state?.success) toast.success("Configuration Notion mise à jour");
    else if (state?.error) toast.error("Erreur", state.error);
  }, [state]);

  const handleDetect = () => {
    setDetectError(null);
    startDetect(async () => {
      const parentPageId = parseNotionPageId(parentPageValue);
      const result = await detectNotionDatabases(tokenValue.trim(), parentPageId);
      if (!result.success) {
        setDetectError(result.error);
        return;
      }

      const updates: Partial<Record<DbFieldKey, string>> = {};
      const detected = new Set<DbFieldKey>();
      const usedFields = new Set<DbFieldKey>();

      for (const db of result.databases) {
        const field = matchDatabaseToField(db.title);
        if (field && !usedFields.has(field)) {
          updates[field] = db.id.replace(/-/g, "");
          detected.add(field);
          usedFields.add(field);
        }
      }

      setDbValues((prev) => ({ ...prev, ...updates }));
      setAutoDetected(detected);
      setDetectionDone(true);
    });
  };

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="notionToken">Token Notion</Label>
        <Input
          id="notionToken"
          name="notionToken"
          value={tokenValue}
          onChange={(e) => setTokenValue(e.target.value)}
          placeholder="ntn_…"
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notionParentPageId">Page parent ImmoPilot (URL ou ID)</Label>
        <Input
          id="notionParentPageId"
          name="notionParentPageId"
          value={parentPageValue}
          onChange={(e) => setParentPageValue(e.target.value)}
          placeholder="https://notion.so/... ou ID de la page"
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="default"
          disabled={!canDetect || detecting}
          onClick={handleDetect}
          className="inline-flex items-center gap-2"
        >
          {detecting ? (
            <>
              <Spinner />
              Détection en cours…
            </>
          ) : (
            "🔍 Détecter les bases"
          )}
        </Button>

        {detectError && (
          <Alert variant="destructive">{detectError}</Alert>
        )}
      </div>

      {DB_FIELDS.map(({ name, label }) => (
        <div key={name} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor={name}>{label}</Label>
            {detectionDone && autoDetected.has(name) && (
              <Badge variant="success">Auto-détecté</Badge>
            )}
            {detectionDone && !autoDetected.has(name) && (
              <Badge variant="warning">À renseigner</Badge>
            )}
          </div>
          <Input
            id={name}
            name={name}
            value={dbValues[name]}
            onChange={(e) =>
              setDbValues((prev) => ({ ...prev, [name]: e.target.value }))
            }
            placeholder="ID de la base…"
            className="font-mono text-xs"
          />
        </div>
      ))}

      <div className="space-y-1.5">
        <Label htmlFor="promptAgentAjouterTache">Prompt — Ajouter une tâche</Label>
        <Input
          id="promptAgentAjouterTache"
          name="promptAgentAjouterTache"
          defaultValue={defaultValues?.promptAgentAjouterTache ?? ""}
          placeholder="ID de la page…"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
