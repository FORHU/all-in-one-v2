"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  MoreHorizontal as MoreHorizontalIcon,
  RotateCw as RotateCwIcon,
} from "lucide-react";
import { notify } from "@/shared/lib/notify";
import { StaffStatsBar } from "./StaffStatsBar";
import { StaffFilterBar } from "./StaffFilterBar";
import {
  ROLE_STYLES,
  STATUS_STYLES,
  UNKNOWN_STYLE,
  avatarColorForRole,
  displayRole,
  formatLastActive,
  initials,
} from "../lib/presentation";

// Structurally matches features/users' `User` type (role as the backend's
// raw string) without importing it — features/staff can't depend on
// features/users directly (FAOS boundary), so the app layer fetches real
// accounts, filters to staff-tier roles, and passes them in as this
// locally-owned shape instead.
export type StaffAccount = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
};

type StaffTableProps = {
  accounts: StaffAccount[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
};

export function StaffTable({
  accounts,
  isLoading,
  isError,
  error,
  onRetry,
}: StaffTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      (accounts ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: displayRole(a.role),
        status: a.isActive ? ("Active" as const) : ("Inactive" as const),
        lastActive: formatLastActive(a.lastLoginAt),
      })),
    [accounts],
  );

  const filtered = useMemo(() => {
    return rows.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [rows, search, roleFilter]);

  const notAvailable = (message: string) => {
    notify.info(message);
    setOpenMenu(null);
  };

  return (
    <div>
      <StaffStatsBar accounts={rows} isLoading={isLoading} />
      <StaffFilterBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[2fr_2fr_1.1fr_1fr_1fr_1.2fr] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          <span>Staff</span>
          <span>Email</span>
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
                Couldn&apos;t load registered accounts
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
          filtered.map((m) => {
            const roleStyle = m.role ? ROLE_STYLES[m.role] : UNKNOWN_STYLE;
            const statusStyle =
              STATUS_STYLES[m.status.toLowerCase()] ?? UNKNOWN_STYLE;

            return (
              <div
                key={m.id}
                className="grid grid-cols-[2fr_2fr_1.1fr_1fr_1fr_1.2fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
                    style={{ background: avatarColorForRole(m.role) }}
                  >
                    {initials(m.name)}
                  </div>
                  <p className="truncate text-sm font-semibold text-[var(--shop-text)]">
                    {m.name}
                  </p>
                </div>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {m.email}
                </span>
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: roleStyle.bg, color: roleStyle.color }}
                >
                  {m.role ?? "Unassigned"}
                </span>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: statusStyle.color }}
                  />
                  {m.status}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {m.lastActive}
                </span>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      notAvailable("Editing roles isn't wired up yet.")
                    }
                    className="text-xs font-semibold text-[var(--shop-accent)] hover:underline"
                  >
                    Edit role
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === m.id ? null : m.id)
                      }
                      aria-label={`Actions for ${m.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </button>
                    {openMenu === m.id && (
                      <div className="absolute right-0 top-8 z-10 w-[160px] rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1.5 shadow-lg">
                        <button
                          type="button"
                          onClick={() =>
                            notAvailable(
                              "Resending invites isn't wired up yet.",
                            )
                          }
                          className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
                        >
                          Resend invite
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            notAvailable("Removing staff isn't wired up yet.")
                          }
                          className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)]"
                        >
                          Remove staff
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
