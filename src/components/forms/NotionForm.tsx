"use client";

import { useActionState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { NotionConfig } from "@/lib/schemas/notion.schema";

type FormState = { error?: string; success?: boolean } | undefined;

interface NotionFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: Partial<NotionConfig>;
}

const NOTION_FIELDS: { name: keyof NotionConfig; label: string }[] = [
  { name: "notionToken", label: "Token Notion" },
  { name: "leadsAcquereurs", label: "DB — Leads acquéreurs" },
  { name: "visites", label: "DB — Visites" },
  { name: "biens", label: "DB — Biens" },
  { name: "relances", label: "DB — Relances" },
  { name: "equipe", label: "DB — Équipe" },
  { name: "contacts", label: "DB — Contacts" },
  { name: "taches", label: "DB — Tâches" },
  { name: "templateMessages", label: "DB — Template messages" },
  { name: "promptAgentAjouterTache", label: "Prompt — Ajouter une tâche" },
];

export function NotionForm({ action, defaultValues }: NotionFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  useEffect(() => {
    if (state?.success) toast.success("Configuration Notion mise à jour");
    else if (state?.error) toast.error("Erreur", state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {NOTION_FIELDS.map(({ name, label }) => {
        const isTechnical = name !== "promptAgentAjouterTache";
        return (
          <div key={name} className="space-y-1.5">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              defaultValue={(defaultValues?.[name] as string | null | undefined) ?? ""}
              placeholder={name === "notionToken" ? "secret_…" : "ID de la base…"}
              className={isTechnical ? "font-mono text-xs" : undefined}
            />
          </div>
        );
      })}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
