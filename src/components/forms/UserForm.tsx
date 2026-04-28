"use client";

import { useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/schemas/user.schema";

type FormState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

interface UserFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: Partial<User>;
  submitLabel?: string;
}

export function UserForm({ action, defaultValues, submitLabel = "Enregistrer" }: UserFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const [crmType, setCrmType] = useState(defaultValues?.crmType ?? "");

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstname">Prénom</Label>
          <Input id="firstname" name="firstname" defaultValue={defaultValues?.firstname ?? ""} />
          {state?.fieldErrors?.firstname && (
            <p className="text-xs text-red-500">{state.fieldErrors.firstname[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastname">Nom</Label>
          <Input id="lastname" name="lastname" defaultValue={defaultValues?.lastname ?? ""} required />
          {state?.fieldErrors?.lastname && (
            <p className="text-xs text-red-500">{state.fieldErrors.lastname[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} required />
        {state?.fieldErrors?.email && (
          <p className="text-xs text-red-500">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
          <Input id="telegramChatId" name="telegramChatId" defaultValue={defaultValues?.telegramChatId ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? ""}
            className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm outline-none focus:border-emerald focus:ring-1 focus:ring-emerald"
          >
            <option value="">— choisir —</option>
            <option value="PENDING">PENDING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      <hr className="border-gray-100" />
      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Configuration CRM</p>

      <div className="space-y-1.5">
        <Label htmlFor="crmType">Type CRM</Label>
        <select
          id="crmType"
          name="crmType"
          defaultValue={defaultValues?.crmType ?? ""}
          onChange={(e) => setCrmType(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm outline-none focus:border-emerald focus:ring-1 focus:ring-emerald"
        >
          <option value="">— choisir —</option>
          <option value="sheets">Google Sheets</option>
          <option value="notion">Notion</option>
        </select>
      </div>

      {(crmType || defaultValues?.crmType) === "sheets" && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="googleSpreadsheetId">Spreadsheet ID</Label>
            <Input id="googleSpreadsheetId" name="googleSpreadsheetId" defaultValue={defaultValues?.googleSpreadsheetId ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gmailLabel">Gmail Label</Label>
            <Input id="gmailLabel" name="gmailLabel" defaultValue={defaultValues?.gmailLabel ?? ""} />
          </div>
        </>
      )}

      {(crmType || defaultValues?.crmType) === "notion" && (
        <p className="text-xs text-muted bg-gray-50 rounded-lg px-4 py-3">
          La configuration Notion se gère dans la section <strong>Notion</strong>.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="calendarId">Calendar ID</Label>
        <Input id="calendarId" name="calendarId" defaultValue={defaultValues?.calendarId ?? ""} placeholder="primary" />
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : submitLabel}
      </Button>
    </form>
  );
}
