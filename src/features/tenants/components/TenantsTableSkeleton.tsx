import { Skeleton } from "@/shared/components/Skeleton";

export function TenantsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[var(--shop-border)] px-[18px] py-4 last:border-b-0"
        >
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
