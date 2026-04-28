"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Branding } from "@/lib/schemas/branding.schema";

type FormState = { error?: string; success?: boolean; fieldErrors?: Record<string, string[]> } | undefined;

interface BrandingFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: Partial<Branding>;
}

export function BrandingForm({ action, defaultValues }: BrandingFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="emailHeaderUrl">Email Header URL</Label>
        <Input
          id="emailHeaderUrl"
          name="emailHeaderUrl"
          type="url"
          defaultValue={defaultValues?.emailHeaderUrl ?? ""}
          placeholder="https://…"
        />
        {state?.fieldErrors?.emailHeaderUrl && (
          <p className="text-xs text-red-500">{state.fieldErrors.emailHeaderUrl[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="emailFooterUrl">Email Footer URL</Label>
        <Input
          id="emailFooterUrl"
          name="emailFooterUrl"
          type="url"
          defaultValue={defaultValues?.emailFooterUrl ?? ""}
          placeholder="https://…"
        />
        {state?.fieldErrors?.emailFooterUrl && (
          <p className="text-xs text-red-500">{state.fieldErrors.emailFooterUrl[0]}</p>
        )}
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald">Branding mis à jour.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
