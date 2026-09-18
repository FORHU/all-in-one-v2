"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  MoreHorizontal as MoreHorizontalIcon,
  RotateCw as RotateCwIcon,
  UserPlus as UserPlusIcon,
} from "lucide-react";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";

// Pure presentation, no feature imports — the app-layer page (staff/page.tsx)
// normalizes both platform accounts (features/users) and tenant memberships
// (features/tenant-staff) into this one shape first, the same way AppSidebar
// receives plain SidebarTenant/SidebarUser data rather than importing a
// feature directly.
export type UnifiedStaffRow = {
  id: string; // user.id for a platform row, membership.id for a tenant row
  kind: "platform" | "tenant";
  name: string;
  email: string;
  roleBadge: { label: string; bg: string; color: string };
  /** "Platform" for a platform row, the store's name for a tenant row. */
  tenantBadge: { label: string; bg: string; color: string };
  statusBadge: { label: string; bg: string; color: string };
  /** Formatted date, or "—" for a tenant row (TenantMembership has no last-activity field). */
  lastActive: string;
  isSelf: boolean;
};

type UnifiedStaffTableProps = {
  rows: UnifiedStaffRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  onManageRow: (id: string, kind: "platform" | "tenant") => void;
  onGrant: () => void;
  onInvite: () => void;
};

export function UnifiedStaffTable({
  rows,
  isLoading,
  isError,
  error,
  onRetry,
  onManageRow,
  onGrant,
  onInvite,
}: UnifiedStaffTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");

  const allRows = useMemo(() => rows ?? [], [rows]);

  const roleOptions: DropdownOption[] = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of allRows) seen.set(r.roleBadge.label, r.roleBadge.color);
    return [
      { value: "all", label: "All roles" },
      ...[...seen.entries()].map(([label, color]) => ({
        value: label,
        label,
        indicatorColor: color,
      })),
    ];
  }, [allRows]);

  const tenantOptions: DropdownOption[] = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of allRows) seen.set(r.tenantBadge.label, r.tenantBadge.color);
    return [
      { value: "all", label: "All stores" },
      ...[...seen.entries()].map(([label, color]) => ({
        value: label,
        label,
        indicatorColor: color,
      })),
    ];
  }, [allRows]);

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      if (roleFilter !== "all" && r.roleBadge.label !== roleFilter)
        return false;
      if (tenantFilter !== "all" && r.tenantBadge.label !== tenantFilter)
        return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [allRows, search, roleFilter, tenantFilter]);

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="mr-auto flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Staff & Roles
          </h2>
          <span className="text-xs text-[var(--shop-text-muted)]">
            {isLoading ? "—" : allRows.length} total
          </span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-56 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
        <button
          type="button"
          onClick={onInvite}
          className="flex items-center gap-1.5 rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)]"
        >
          <UserPlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Invite staff
        </button>
        <button
          type="button"
          onClick={onGrant}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <UserPlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Grant store access
        </button>
      </div>

      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <Dropdown
          value={roleFilter}
          options={roleOptions}
          onChange={setRoleFilter}
          size="sm"
          className="w-[150px]"
          aria-label="Filter by role"
        />
        <Dropdown
          value={tenantFilter}
          options={tenantOptions}
          onChange={setTenantFilter}
          size="sm"
          className="w-[170px]"
          aria-label="Filter by store"
        />
        <span className="ml-auto text-xs text-[var(--shop-text-muted)]">
          {filtered.length} results
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_0.9fr_1fr_0.7fr] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          <span>Staff</span>
          <span>Email</span>
          <span>Store</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last Active</span>
          <span />
        </div>

        {isLoading ? (
          <div className="space-y-2 p-[18px]">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-[var(--shop-bg-soft)]"
              />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-start gap-3 p-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangleIcon
                className="h-5 w-5 flex-shrink-0"
                style={{ color: "var(--shop-danger)" }}
                strokeWidth={2.25}
              />
              <p className="text-sm font-semibold text-[var(--shop-text)]">
                Couldn&apos;t load staff accounts
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching accounts."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              <RotateCwIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
            No staff match your search.
          </p>
        ) : (
          filtered.map((r) => (
            <div
              key={`${r.kind}:${r.id}`}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_0.9fr_1fr_0.7fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
                  style={{ background: r.roleBadge.color }}
                >
                  {initials(r.name)}
                </div>
                <p className="truncate text-sm font-semibold text-[var(--shop-text)]">
                  {r.name}
                  {r.isSelf && (
                    <span className="ml-1.5 text-[11px] font-medium text-[var(--shop-text-muted)]">
                      (you)
                    </span>
                  )}
                </p>
              </div>
              <span className="truncate text-xs text-[var(--shop-text-muted)]">
                {r.email}
              </span>
              <span
                className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                style={{
                  background: r.tenantBadge.bg,
                  color: r.tenantBadge.color,
                }}
              >
                {r.tenantBadge.label}
              </span>
              <span
                className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                style={{ background: r.roleBadge.bg, color: r.roleBadge.color }}
              >
                {r.roleBadge.label}
              </span>
              <span
                className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                style={{
                  background: r.statusBadge.bg,
                  color: r.statusBadge.color,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: r.statusBadge.color }}
                />
                {r.statusBadge.label}
              </span>
              <span className="text-xs text-[var(--shop-text-muted)]">
                {r.lastActive}
              </span>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onManageRow(r.id, r.kind)}
                  aria-label={`Manage ${r.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
                >
                  <MoreHorizontalIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w));
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}
