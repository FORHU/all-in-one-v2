"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/AppShell";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    router.push("/");
  };

  return <AppShell onLogout={handleLogout}>{children}</AppShell>;
}
