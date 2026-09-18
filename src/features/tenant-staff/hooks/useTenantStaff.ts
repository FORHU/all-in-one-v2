"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { notify } from "@/shared/lib/notify";
import {
  getTenantMemberships,
  getMyMemberships,
  getAllTenantMemberships,
  grantMembership,
  updateMembershipRole,
  removeMembership,
} from "../api/tenant-staff.client";
import { tenantStaffKeys } from "../api/tenant-staff.keys";

/**
 * GET /api/v2/tenant-memberships — the current store's roster. Requires
 * `tenant_staff:manage` (OWNER/ADMIN_MANAGER, or a platform admin) — callers
 * without it should pass `enabled: false` rather than let this 403.
 */
export function useTenantMembers(options?: { enabled?: boolean }) {
  return useSafeQuery({
    queryKey: tenantStaffKeys.lists(),
    queryFn: getTenantMemberships,
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/**
 * GET /api/v2/tenant-memberships/mine — every store the signed-in account
 * belongs to. Used by the admin layout to auto-lock a non-platform-admin to
 * their own store instead of trusting whatever tenant slug is (possibly
 * stale/foreign) in localStorage.
 */
export function useMyMemberships(options?: { enabled?: boolean }) {
  return useSafeQuery({
    queryKey: tenantStaffKeys.mine(),
    queryFn: getMyMemberships,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/**
 * GET /api/v2/tenant-memberships/all — every store's roster at once.
 * Platform-admin-only (`platform:manage`); callers without it should pass
 * `enabled: false`.
 */
export function useAllTenantMemberships(options?: { enabled?: boolean }) {
  return useSafeQuery({
    queryKey: tenantStaffKeys.crossTenant(),
    queryFn: getAllTenantMemberships,
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export function useGrantMembership() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: grantMembership,
    onSuccess: (membership) => {
      queryClient.invalidateQueries({ queryKey: tenantStaffKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tenantStaffKeys.crossTenant(),
      });
      notify.success(`${membership.user.name ?? membership.user.email} added.`);
    },
  });
}

export function useUpdateMembershipRole() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      updateMembershipRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantStaffKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tenantStaffKeys.crossTenant(),
      });
      notify.success("Role updated.");
    },
  });
}

export function useRemoveMembership() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => removeMembership(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantStaffKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tenantStaffKeys.crossTenant(),
      });
      notify.success("Member removed.");
    },
  });
}
