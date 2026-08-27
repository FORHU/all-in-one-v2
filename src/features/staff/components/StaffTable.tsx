"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  MoreHorizontal as MoreHorizontalIcon,
  RotateCw as RotateCwIcon,
  UserPlus as UserPlusIcon,
} from "lucide-react";
import { Pagination } from "@/shared/components/Pagination";
import { StaffStatsBar } from "./StaffStatsBar";
import { StaffFilterBar } from "./StaffFilterBar";
import { StaffAccountModal } from "./StaffAccountModal";
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

export type StaffEditInput = { role: string; isActive: boolean };

type StaffTableProps = {
  /** Rendered inline with the stats/search/action buttons instead of its own stacked row — see ProductsTable's identically-named prop. */
  heading?: { title: string };
  accounts: StaffAccount[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  onInvite: () => void;
  /** The signed-in admin's own id — disables Remove for their own row (mirrors the backend's self-removal guard). */
  currentUserId?: string;
  onSaveEdit: (id: string, data: StaffEditInput) => Promise<void>;
  /** id of the account currently being saved, so the modal can disable + relabel its own button. */
  savingId?: string | null;
  onRemove: (id: string) => Promise<void>;
  removingId?: string | null;
  /** Backend-driven pagination over the fetched (staff+customer) page — see ProductsTable's identically-named props. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function toRow(a: StaffAccount) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    role: displayRole(a.role),
    isActive: a.isActive,
    status: a.isActive ? ("Active" as const) : ("Inactive" as const),
    lastActive: formatLastActive(a.lastLoginAt),
    account: a,
  };
}

export function StaffTable({
  heading,
  accounts,
  isLoading,
  isError,
  error,
  onRetry,
  onInvite,
  currentUserId,
  onSaveEdit,
  savingId,
  onRemove,
  removingId,
  page,
  totalPages,
  onPageChange,
}: StaffTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openAccount, setOpenAccount] = useState<StaffAccount | null>(null);

  const rows = useMemo(() => (accounts ?? []).map(toRow), [accounts]);

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

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="mr-auto flex flex-wrap items-center gap-x-3 gap-y-1">
          {heading && (
            <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
              {heading.title}
            </h2>
          )}
          <StaffStatsBar accounts={rows} isLoading={isLoading} />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff by name or email"
          className="w-56 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]"
        />
        <button
          type="button"
          onClick={onInvite}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <UserPlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Invite staff
        </button>
      </div>

      <StaffFilterBar
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        resultsCount={filtered.length}
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
            const isSelf = m.id === currentUserId;

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
                    {isSelf && (
                      <span className="ml-1.5 text-[11px] font-medium text-[var(--shop-text-muted)]">
                        (you)
                      </span>
                    )}
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
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpenAccount(m.account)}
                    aria-label={`Manage ${m.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
                  >
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isLoading && !isError && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      {openAccount && (
        <StaffAccountModal
          account={openAccount}
          isSelf={openAccount.id === currentUserId}
          onClose={() => setOpenAccount(null)}
          onSave={onSaveEdit}
          isSaving={savingId === openAccount.id}
          onRemove={onRemove}
          isRemoving={removingId === openAccount.id}
        />
      )}
    </div>
  );
}
