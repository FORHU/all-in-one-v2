import { ReactNode } from "react";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { Permission } from "@/shared/auth/permissions";

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
