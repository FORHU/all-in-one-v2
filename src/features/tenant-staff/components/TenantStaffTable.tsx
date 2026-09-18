"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle as AlertTriangleIcon,
  MoreHorizontal as MoreHorizontalIcon,
  RotateCw as RotateCwIcon,
  UserPlus as UserPlusIcon,
} from "lucide-react";
import {
  useTenantMembers,
  useGrantMembership,
  useUpdateMembershipRole,
  useRemoveMembership,
} from "../hooks/useTenantStaff";
import { canActingRoleModify, canManageTenantStaff } from "../lib/permissions";
import {
  ROLE_STYLES,
  UNKNOWN_STYLE,
  MEMBERSHIP_STATUS_STYLES,
  displayRole,
  initials,
} from "../lib/presentation";
import { GrantMembershipModal } from "./GrantMembershipModal";
import { EditMembershipModal } from "./EditMembershipModal";
import type { TenantMembership } from "../contracts/tenant-staff.contract";

type TenantStaffTableProps = {
  /** The signed-in user's own tenant role — narrows what can be granted/edited (see lib/permissions.ts). */
  actingRole: string | null | undefined;
  /** The signed-in user's id — disables Remove for their own row. */
  currentUserId?: string;
};

export function TenantStaffTable({
  actingRole,
  currentUserId,
}: TenantStaffTableProps) {
  const {
    data: members,
    isLoading,
    isError,
    error,
    refetch,
  } = useTenantMembers();
  const grant = useGrantMembership();
  const updateRole = useUpdateMembershipRole();
  const remove = useRemoveMembership();

  const [granting, setGranting] = useState(false);
  const [editing, setEditing] = useState<TenantMembership | null>(null);

  const rows = useMemo(() => members ?? [], [members]);
  // A plain ADMIN can reach this page (tenant_staff:read) but never
  // grant/edit/remove anyone — only OWNER/ADMIN_MANAGER can manage at all.
  const canManage = canManageTenantStaff(actingRole);

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Team
        </h2>
        {canManage && (
          <button
            type="button"
            onClick={() => setGranting(true)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
            style={{ backgroundColor: "var(--shop-accent-dark)" }}
          >
            <UserPlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            Grant access
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          <span>Member</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span />
        </div>

        {isLoading ? (
          <div className="space-y-2 p-[18px]">
            {[...Array(3)].map((_, i) => (
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
                Couldn&apos;t load this store&apos;s team
              </p>
            </div>
            <p className="text-sm text-[var(--shop-text-muted)]">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching members."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
              style={{ backgroundColor: "var(--shop-accent-dark)" }}
            >
              <RotateCwIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
            Nobody has been granted access to this store yet.
          </p>
        ) : (
          rows.map((m) => {
            const style = ROLE_STYLES[m.role] ?? UNKNOWN_STYLE;
            const statusStyle =
              MEMBERSHIP_STATUS_STYLES[m.status.toLowerCase()] ?? UNKNOWN_STYLE;
            const isSelf = m.userId === currentUserId;
            const canModify = canActingRoleModify(actingRole, m.role);

            return (
              <div
                key={m.id}
                className="grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
                    style={{ background: style.color }}
                  >
                    {initials(m.user.name ?? m.user.username)}
                  </div>
                  <p className="truncate text-sm font-semibold text-[var(--shop-text)]">
                    {m.user.name ?? m.user.username}
                    {isSelf && (
                      <span className="ml-1.5 text-[11px] font-medium text-[var(--shop-text-muted)]">
                        (you)
                      </span>
                    )}
                  </p>
                </div>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {m.user.email}
                </span>
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: style.bg, color: style.color }}
                >
                  {displayRole(m.role)}
                </span>
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold capitalize"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                  }}
                >
                  {m.status.toLowerCase()}
                </span>
                <div className="flex justify-end">
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setEditing(m)}
                      disabled={!canModify}
                      aria-label={`Manage ${m.user.name ?? m.user.email}`}
                      title={
                        !canModify
                          ? "You don't have permission to change this member"
                          : undefined
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {granting && (
        <GrantMembershipModal
          actingRole={actingRole}
          onClose={() => setGranting(false)}
          onGrant={(input) => grant.mutateAsync(input).then(() => undefined)}
          isGranting={grant.isPending}
        />
      )}

      {editing && (
        <EditMembershipModal
          membership={editing}
          actingRole={actingRole}
          isSelf={editing.userId === currentUserId}
          onClose={() => setEditing(null)}
          onSave={(id, role) =>
            updateRole.mutateAsync({ id, role }).then(() => undefined)
          }
          isSaving={updateRole.isPending}
          onRemove={(id) => remove.mutateAsync(id).then(() => undefined)}
          isRemoving={remove.isPending}
        />
      )}
    </div>
  );
}
