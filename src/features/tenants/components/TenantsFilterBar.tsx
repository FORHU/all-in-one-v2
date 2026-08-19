"use client";

const STATUS_CHIPS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "onboarding", label: "Onboarding" },
  { key: "suspended", label: "Suspended" },
] as const;

type TenantsFilterBarProps = {
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
};

export function TenantsFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: TenantsFilterBarProps) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-3">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by store, slug, or domain"
        className="w-72 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
      />
      <div
        role="group"
        aria-label="Filter by status"
        className="flex flex-wrap gap-2"
      >
        {STATUS_CHIPS.map((chip) => {
          const on = statusFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onStatusFilterChange(chip.key)}
              aria-pressed={on}
              className="rounded-full border px-3.5 py-1.5 text-xs font-bold transition"
              style={{
                background: on ? "var(--shop-ink)" : "var(--shop-surface)",
                color: on ? "var(--shop-bg)" : "var(--shop-text-muted)",
                borderColor: on ? "var(--shop-ink)" : "var(--shop-border)",
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
