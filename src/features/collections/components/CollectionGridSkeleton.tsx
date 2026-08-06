import { Skeleton } from "@/shared/components/Skeleton";

export function CollectionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)]"
        >
          <Skeleton className="h-[140px] w-full rounded-none" />
          <div className="p-4">
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
