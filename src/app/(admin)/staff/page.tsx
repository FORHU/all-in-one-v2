"use client";

import { useMemo, useState } from "react";
import {
  UnifiedStaffTable,
  type UnifiedStaffRow,
} from "@/shared/components/UnifiedStaffTable";
import { StaffAccountModal } from "@/features/staff/components/StaffAccountModal";
import {
  ROLE_STYLES as PLATFORM_ROLE_STYLES,
  STATUS_STYLES as PLATFORM_STATUS_STYLES,
  UNKNOWN_STYLE,
  displayRole as displayPlatformRole,
  formatLastActive,
} from "@/features/staff/lib/presentation";
import {
  ROLE_STYLES as TENANT_ROLE_STYLES,
  MEMBERSHIP_STATUS_STYLES,
  displayRole as displayTenantRole,
} from "@/features/tenant-staff/lib/presentation";
import { EditMembershipModal } from "@/features/tenant-staff/components/EditMembershipModal";
import { GrantMembershipModal } from "@/features/tenant-staff/components/GrantMembershipModal";
import {
  useUsers,
  useUpdateUser,
  useRemoveUser,
} from "@/features/users/hooks/useUsers";
import { useTenants } from "@/features/tenants/hooks/useTenants";
import {
  useAllTenantMemberships,
  useGrantMembership,
  useUpdateMembershipRole,
  useRemoveMembership,
} from "@/features/tenant-staff/hooks/useTenantStaff";
import { useMe } from "@/features/auth/hooks/useAuth";
import { notify } from "@/shared/lib/notify";

// This platform-wide page only ever shows genuinely platform-level accounts.
// "ADMIN" is intentionally absent — the backend's UserRole enum no longer has
// that value at all; per-store ADMIN access is a TenantMembership row now
// (the "tenant" rows below), not a platform role.
const PLATFORM_STAFF_ROLES = new Set(["SUPER_ADMIN", "DEVELOPER"]);

const PLATFORM_TENANT_BADGE = {
  label: "Platform",
  bg: "var(--shop-neutral-bg)",
  color: "var(--shop-neutral)",
};

const PAGE_SIZE = 100;

function platformRoleBadge(apiRole: string) {
  const label = displayPlatformRole(apiRole);
  return {
    label: label ?? apiRole,
    ...(label ? PLATFORM_ROLE_STYLES[label] : UNKNOWN_STYLE),
  };
}

export default function StaffPage() {
  const { data: me } = useMe();
  const {
    data: usersPage,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErrorObj,
    refetch: refetchUsers,
  } = useUsers({ page: 1, limit: PAGE_SIZE });
  const { data: tenants } = useTenants();
  const {
    data: memberships,
    isLoading: membershipsLoading,
    isError: membershipsError,
    error: membershipsErrorObj,
    refetch: refetchMemberships,
  } = useAllTenantMemberships();

  const updateUser = useUpdateUser();
  const removeUser = useRemoveUser();
  const grant = useGrantMembership();
  const updateRole = useUpdateMembershipRole();
  const removeMembership = useRemoveMembership();

  const [granting, setGranting] = useState(false);
  const [openRow, setOpenRow] = useState<{
    id: string;
    kind: "platform" | "tenant";
  } | null>(null);

  const rows: UnifiedStaffRow[] = useMemo(() => {
    const platformRows: UnifiedStaffRow[] = (usersPage?.items ?? [])
      .filter((u) => PLATFORM_STAFF_ROLES.has(u.role))
      .map((u) => ({
        id: u.id,
        kind: "platform" as const,
        name: u.name ?? u.username,
        email: u.email,
        roleBadge: platformRoleBadge(u.role),
        tenantBadge: PLATFORM_TENANT_BADGE,
        statusBadge: {
          label: u.isActive ? "Active" : "Inactive",
          ...(PLATFORM_STATUS_STYLES[u.isActive ? "active" : "inactive"] ??
            UNKNOWN_STYLE),
        },
        lastActive: formatLastActive(u.lastLoginAt),
        isSelf: u.id === me?.id,
      }));

    const tenantRows: UnifiedStaffRow[] = (memberships ?? []).map((m) => ({
      id: m.id,
      kind: "tenant" as const,
      name: m.user.name ?? m.user.username,
      email: m.user.email,
      roleBadge: {
        label: displayTenantRole(m.role),
        ...(TENANT_ROLE_STYLES[m.role] ?? UNKNOWN_STYLE),
      },
      tenantBadge: {
        label: m.tenant?.name ?? "Unknown store",
        bg: "var(--shop-neutral-bg)",
        color: "var(--shop-neutral)",
      },
      statusBadge: {
        label: m.status.charAt(0) + m.status.slice(1).toLowerCase(),
        ...(MEMBERSHIP_STATUS_STYLES[m.status.toLowerCase()] ?? UNKNOWN_STYLE),
      },
      lastActive: "—",
      isSelf: m.userId === me?.id,
    }));

    return [...platformRows, ...tenantRows];
  }, [usersPage, memberships, me]);

  const openPlatformAccount = usersPage?.items.find(
    (u) => u.id === openRow?.id,
  );
  const openMembership = memberships?.find((m) => m.id === openRow?.id);

  const tenantOptions = useMemo(
    () => (tenants ?? []).map((t) => ({ value: t.id, label: t.name })),
    [tenants],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <UnifiedStaffTable
        rows={rows}
        isLoading={usersLoading || membershipsLoading}
        isError={usersError || membershipsError}
        error={usersErrorObj ?? membershipsErrorObj}
        onRetry={() => {
          refetchUsers();
          refetchMemberships();
        }}
        onManageRow={(id, kind) => setOpenRow({ id, kind })}
        onGrant={() => setGranting(true)}
        onInvite={() => notify.info("Inviting staff isn't wired up yet.")}
      />

      {granting && (
        <GrantMembershipModal
          actingRole="OWNER"
          tenantOptions={tenantOptions}
          onClose={() => setGranting(false)}
          onGrant={(input) => grant.mutateAsync(input).then(() => undefined)}
          isGranting={grant.isPending}
        />
      )}

      {openRow?.kind === "platform" && openPlatformAccount && (
        <StaffAccountModal
          account={{
            id: openPlatformAccount.id,
            name: openPlatformAccount.name ?? openPlatformAccount.username,
            email: openPlatformAccount.email,
            role: openPlatformAccount.role,
            isActive: openPlatformAccount.isActive,
            lastLoginAt: openPlatformAccount.lastLoginAt,
          }}
          isSelf={openPlatformAccount.id === me?.id}
          onClose={() => setOpenRow(null)}
          onSave={async (id, data) => {
            await updateUser.mutateAsync({ id, data });
            notify.success("Staff account updated.");
          }}
          isSaving={updateUser.isPending}
          onRemove={async (id) => {
            await removeUser.mutateAsync(id);
            notify.success("Staff account removed.");
          }}
          isRemoving={removeUser.isPending}
        />
      )}

      {openRow?.kind === "tenant" && openMembership && (
        <EditMembershipModal
          membership={openMembership}
          actingRole="OWNER"
          isSelf={openMembership.userId === me?.id}
          onClose={() => setOpenRow(null)}
          onSave={(id, role) =>
            updateRole.mutateAsync({ id, role }).then(() => undefined)
          }
          isSaving={updateRole.isPending}
          onRemove={(id) =>
            removeMembership.mutateAsync(id).then(() => undefined)
          }
          isRemoving={removeMembership.isPending}
        />
      )}
    </div>
  );
}
