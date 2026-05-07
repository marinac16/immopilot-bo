export type ToastVariant = "success" | "error" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastItem extends ToastInput {
  id: string;
}

type Listener = (toast: ToastItem) => void;
const listeners = new Set<Listener>();

function uid() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function toast(input: ToastInput): string {
  const item: ToastItem = { id: uid(), variant: "info", duration: 4000, ...input };
  listeners.forEach((fn) => fn(item));
  return item.id;
}

toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: "success" });

toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: "error", duration: 6000 });

toast.info = (title: string, description?: string) =>
  toast({ title, description, variant: "info" });

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
