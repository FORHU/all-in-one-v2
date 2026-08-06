import { Skeleton } from "@/shared/components/Skeleton";

export function SupplierGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3.5 rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5"
        >
          <Skeleton className="h-11 w-11 rounded-[10px]" />
          <div>
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
