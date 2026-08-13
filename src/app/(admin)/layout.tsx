"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/AppShell";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useTenants } from "@/features/tenants/hooks/useTenants";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { getNavItems } from "@/shared/navigation/nav-items";
import { clearRefreshToken } from "@/shared/lib/token";

function getPageTitle(
  pathname: string,
  isPlatformScope: boolean,
): string | undefined {
  for (const item of getNavItems(isPlatformScope)) {
    const child = item.children?.find((c) => c.href === pathname);
    if (child) return child.label;
    if (item.href === pathname) return item.label;
  }
  return undefined;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useAuthStore((s) => s.setRole);
  const { data: me, isLoading: isMeLoading } = useMe();

  // GET /tenants/all (behind useTenants) requires platform:manage, which
  // only SUPER_ADMIN/DEVELOPER accounts hold — checked against the raw API
  // role, not the coarsened client RBAC `Role` (which maps ADMIN to the same
  // "admin" tier as SUPER_ADMIN/DEVELOPER and would over-grant this). Every
  // other role is scoped to one tenant and has no use for a store switcher,
  // so the query is skipped entirely rather than firing and 403ing on every
  // admin page load.
  const isPlatformAdmin =
    me?.role === "SUPER_ADMIN" || me?.role === "DEVELOPER";
  const { data: tenants, isLoading: isTenantsLoading } = useTenants({
    enabled: isPlatformAdmin,
  });
  const tenantSlug = useTenantStore((s) => s.tenantSlug);
  const setTenantSlug = useTenantStore((s) => s.setTenantSlug);

  // tenantSlug is localStorage-backed, which the server always sees as
  // unset — gate on `mounted` so the first client render's title matches
  // the server's, same pattern AppSidebar uses for the nav itself.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isPlatformScope = !mounted || !tenantSlug;

  const handleLogout = () => {
    setToken(null);
    clearRefreshToken();
    setUser(null);
    setRole("viewer");
    router.push("/");
  };

  return (
    <AppShell
      onLogout={handleLogout}
      title={getPageTitle(pathname, isPlatformScope)}
      me={me}
      isMeLoading={isMeLoading}
      tenants={tenants}
      selectedTenantSlug={tenantSlug}
      onTenantChange={setTenantSlug}
      isTenantsLoading={isTenantsLoading}
    >
      {children}
    </AppShell>
  );
}
