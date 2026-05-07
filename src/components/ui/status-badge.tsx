import { cn } from "@/lib/utils";

type Status = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;

const styles: Record<string, { label: string; className: string; dot: string }> = {
  ACTIVE: {
    label: "Actif",
    className: "bg-emerald/10 text-emerald",
    dot: "bg-emerald",
  },
  PENDING: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  INACTIVE: {
    label: "Inactif",
    className: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
  SUSPENDED: {
    label: "Suspendu",
    className: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

interface StatusBadgeProps {
  status: Status | null | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return <span className="text-xs text-muted">—</span>;
  }

  const style = styles[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        style.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
