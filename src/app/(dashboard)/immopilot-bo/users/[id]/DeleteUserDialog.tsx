"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, X } from "lucide-react";

interface DeleteUserDialogProps {
  user: {
    firstname: string | null;
    lastname: string;
    email: string;
  };
  action: () => Promise<void>;
}

export function DeleteUserDialog({ user, action }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, startTransition] = useTransition();

  const fullName = `${user.firstname ?? ""} ${user.lastname}`.trim();
  const canDelete = confirmation.trim().toLowerCase() === user.email.trim().toLowerCase();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canDelete) return;
    startTransition(async () => {
      await action();
    });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setConfirmation("");
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="destructive" size="sm" type="button">
          Supprimer l&apos;utilisateur
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-100 bg-white p-6 shadow-xl focus:outline-none">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-base font-semibold text-navy">
                Supprimer cet utilisateur ?
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted mt-1">
                Cette action est irréversible.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fermer"
                className="text-muted hover:text-navy transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm font-medium text-navy">{fullName || "—"}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="delete-confirmation">
                Pour confirmer, tapez l&apos;email de l&apos;utilisateur
              </Label>
              <Input
                id="delete-confirmation"
                type="email"
                autoComplete="off"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={user.email}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm">
                  Annuler
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={!canDelete || pending}
              >
                {pending ? "Suppression…" : "Supprimer définitivement"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
