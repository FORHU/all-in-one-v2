"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/AppShell";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useTenants } from "@/features/tenants/hooks/useTenants";
import { useMyMemberships } from "@/features/tenant-staff/hooks/useTenantStaff";
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
  const { data: platformTenants, isLoading: isPlatformTenantsLoading } =
    useTenants({ enabled: isPlatformAdmin });

  // A non-platform-admin has no use for (and no permission for) the platform
  // tenant list above — this is how they discover their own store(s)
  // instead, independent of whatever (possibly stale, possibly belonging to
  // a different user who previously signed in on this browser) tenantSlug
  // is currently sitting in localStorage.
  const { data: myMemberships, isLoading: isMyMembershipsLoading } =
    useMyMemberships({ enabled: Boolean(me) && !isPlatformAdmin });

  const tenantSlug = useTenantStore((s) => s.tenantSlug);
  const setTenantSlug = useTenantStore((s) => s.setTenantSlug);
  const clearTenantSlug = useTenantStore((s) => s.clearTenantSlug);

  // tenantSlug is localStorage-backed, which the server always sees as
  // unset — gate on `mounted` so the first client render's title matches
  // the server's, same pattern AppSidebar uses for the nav itself.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Auto-lock: a non-platform-admin must always be scoped to a store they
  // actually belong to, never to a stale/foreign slug left over from a
  // previous session (or a different user) in this browser. If they hold no
  // active membership anywhere, clear the slug rather than leave a foreign
  // one in place.
  useEffect(() => {
    if (!mounted || !me || isPlatformAdmin) return;
    const ownSlug =
      myMemberships?.find((m) => m.status === "ACTIVE")?.tenant.slug ?? null;
    if (ownSlug && ownSlug !== tenantSlug) setTenantSlug(ownSlug);
    else if (!ownSlug && tenantSlug) clearTenantSlug();
  }, [
    mounted,
    me,
    isPlatformAdmin,
    myMemberships,
    tenantSlug,
    setTenantSlug,
    clearTenantSlug,
  ]);

  // Role check comes first — a non-platform-admin must never reach Platform
  // scope, regardless of tenantSlug's transient state while the lock above
  // is still resolving. `!mounted` keeps the very first client render
  // matching the server's (Platform scope) to avoid a hydration mismatch.
  const isPlatformScope = !mounted || (isPlatformAdmin && !tenantSlug);

  const sidebarTenants = isPlatformAdmin
    ? platformTenants
    : myMemberships?.map((m) => ({ slug: m.tenant.slug, name: m.tenant.name }));
  const isTenantsLoading = isPlatformAdmin
    ? isPlatformTenantsLoading
    : isMyMembershipsLoading;

  const handleLogout = () => {
    setToken(null);
    clearRefreshToken();
    setUser(null);
    setRole("viewer");
    router.push("/login");
  };

  return (
    <AppShell
      onLogout={handleLogout}
      title={getPageTitle(pathname, isPlatformScope)}
      me={me}
      isMeLoading={isMeLoading}
      tenants={sidebarTenants}
      selectedTenantSlug={tenantSlug}
      onTenantChange={setTenantSlug}
      isTenantsLoading={isTenantsLoading}
      isPlatformScope={isPlatformScope}
      canSwitchTenant={isPlatformAdmin}
    >
      {children}
    </AppShell>
  );
}
