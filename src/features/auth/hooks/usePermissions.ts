import { useAuthStore } from "../stores/auth.store";
import { hasPermission } from "@/shared/auth/rbac";
import type { Permission } from "@/shared/auth/permissions";

export function usePermissions() {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);

  const can = (permission: Permission) => hasPermission(role, permission);

  return { can, role, user };
}
