import { cn } from "@/lib/utils";

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

export function Alert({ children, variant = "default", className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variant === "destructive" && "border-red-200 bg-red-50 text-red-800",
        variant === "default" && "border-line bg-gray-50 text-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
}
