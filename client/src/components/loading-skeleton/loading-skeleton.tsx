import { Skeleton } from "@/components/ui";

interface LoadingSkeletonProps {
  count?: number;
  compact?: boolean;
}

export function LoadingSkeleton({ count = 3, compact = false }: LoadingSkeletonProps) {
  return (
    <div className={compact ? "grid gap-4 grid-cols-1" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-2 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
