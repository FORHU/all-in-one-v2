"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/AppShell";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useMe } from "@/features/auth/hooks/useAuth";
import { ADMIN_NAV_ITEMS } from "@/shared/navigation/nav-items";
import { clearRefreshToken } from "@/shared/lib/token";

function getPageTitle(pathname: string): string | undefined {
  for (const item of ADMIN_NAV_ITEMS) {
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
      title={getPageTitle(pathname)}
      me={me}
      isMeLoading={isMeLoading}
    >
      {children}
    </AppShell>
  );
}
