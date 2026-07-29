"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/AppShell";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { ADMIN_NAV_ITEMS } from "@/shared/navigation/nav-items";

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

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AppShell onLogout={handleLogout} title={getPageTitle(pathname)}>
      {children}
    </AppShell>
  );
}
