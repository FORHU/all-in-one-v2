import { useAuthStore } from "../stores/auth.store";
import { hasPermission, PermissionContext } from "@/shared/auth/rbac";
import type { Permission } from "@/shared/auth/permissions";

export function usePermissions() {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);

  const can = (permission: string, context?: PermissionContext) => {
    return hasPermission(role, permission as Permission, context, user);
  };

  return { can, role, user };
}
