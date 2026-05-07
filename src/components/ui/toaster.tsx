"use client";

import { useEffect, useState } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeToast, type ToastItem } from "@/lib/toast";

const variantStyles: Record<NonNullable<ToastItem["variant"]>, string> = {
  success: "border-emerald/30 bg-white",
  error: "border-red-200 bg-white",
  info: "border-gray-200 bg-white",
};

const variantIconColor: Record<NonNullable<ToastItem["variant"]>, string> = {
  success: "text-emerald",
  error: "text-red-500",
  info: "text-navy",
};

const variantIcon = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToast((item) => {
      setToasts((prev) => [...prev, item]);
    });
  }, []);

  function handleOpenChange(id: string, open: boolean) {
    if (!open) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((t) => {
        const variant = t.variant ?? "info";
        const Icon = variantIcon[variant];
        return (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration}
            onOpenChange={(open) => handleOpenChange(t.id, open)}
            className={cn(
              "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out",
              "data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-full",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
              "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
              "data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
              variantStyles[variant]
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", variantIconColor[variant])} />
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm font-medium text-navy">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-xs text-muted mt-0.5">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              aria-label="Fermer"
              className="text-muted hover:text-navy transition-colors"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 p-6 outline-none" />
    </ToastPrimitive.Provider>
  );
}
