import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-100/80", className)}
      {...props}
    />
  );
}

interface SectionSkeletonProps {
  title?: string;
  rows?: number;
}

export function SectionSkeleton({ title, rows = 4 }: SectionSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-line p-6">
      <div className="flex items-baseline justify-between mb-4">
        {title ? (
          <h2 className="text-sm font-semibold text-navy">{title}</h2>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-32 mt-2" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-line overflow-hidden">
      <div className="px-6 py-4 border-b border-line flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <ul className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center justify-between px-6 py-4">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-9 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
