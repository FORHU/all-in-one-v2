"use client";

import { useMe } from "@/features/auth/hooks/useAuth";
import { TenantStaffTable } from "@/features/tenant-staff/components/TenantStaffTable";
import { canViewTenantStaff } from "@/features/tenant-staff/lib/permissions";

export default function TeamPage() {
  const { data: me } = useMe();

  // A platform admin (SUPER_ADMIN/DEVELOPER) has no membership row of their
  // own for this store, but the backend still lets them through — same
  // platform-admin-bypass pattern as (admin)/layout.tsx's isPlatformAdmin.
  const isPlatformAdmin =
    me?.role === "SUPER_ADMIN" || me?.role === "DEVELOPER";
  const actingRole = isPlatformAdmin ? "OWNER" : me?.tenantMembership?.role;
  // A plain ADMIN can view this page (tenant_staff:read) but TenantStaffTable
  // itself hides the grant/edit/remove controls unless actingRole passes
  // canManageTenantStaff (OWNER/ADMIN_MANAGER) — see its own gating.
  const canView =
    isPlatformAdmin || canViewTenantStaff(me?.tenantMembership?.role);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      {canView ? (
        <TenantStaffTable actingRole={actingRole} currentUserId={me?.id} />
      ) : (
        <p className="py-16 text-center text-sm text-[var(--shop-text-muted)]">
          You don&apos;t have permission to view this store&apos;s team.
        </p>
      )}
    </div>
  );
}
