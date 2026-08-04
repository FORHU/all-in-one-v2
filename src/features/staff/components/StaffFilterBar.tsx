"use client";

const ROLE_CHIPS = [
  { key: "all", label: "All" },
  { key: "Super Admin", label: "Super Admin" },
  { key: "Admin", label: "Admin" },
  { key: "Developer", label: "Developer" },
] as const;

type StaffFilterBarProps = {
  search: string;
  onSearchChange: (search: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
};

export function StaffFilterBar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: StaffFilterBarProps) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-3">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search staff by name or email"
        className="w-72 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
      />
      <div className="flex flex-wrap gap-2">
        {ROLE_CHIPS.map((chip) => {
          const on = roleFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onRoleFilterChange(chip.key)}
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
