"use client";

import { useActionState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { Branding } from "@/lib/schemas/branding.schema";

type FormState = { error?: string; success?: boolean; fieldErrors?: Record<string, string[]> } | undefined;

interface BrandingFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: Partial<Branding>;
}

export function BrandingForm({ action, defaultValues }: BrandingFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  useEffect(() => {
    if (state?.success) toast.success("Branding mis à jour");
    else if (state?.error) toast.error("Erreur", state.error);
  }, [state]);

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

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
