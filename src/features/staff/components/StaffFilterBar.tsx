"use client";

import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";

// Collapsed from four always-visible pill buttons into one dropdown, same
// shape as features/products' FilterBar (status/category/brand).
const ROLE_DROPDOWN_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All roles" },
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Developer", label: "Developer" },
];

type StaffFilterBarProps = {
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  resultsCount: number;
};

export function StaffFilterBar({
  roleFilter,
  onRoleFilterChange,
  resultsCount,
}: StaffFilterBarProps) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
      <div
        role="group"
        aria-label="Filters"
        className="flex flex-wrap items-center gap-2"
      >
        <Dropdown
          value={roleFilter}
          options={ROLE_DROPDOWN_OPTIONS}
          onChange={onRoleFilterChange}
          size="sm"
          className="w-[150px]"
          aria-label="Filter by role"
        />
      </div>
      <span className="text-xs text-[var(--shop-text-muted)]">
        {resultsCount} results
      </span>
    </div>
  );
}
