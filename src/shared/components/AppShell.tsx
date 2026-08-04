"use client";

import { Menu } from "lucide-react";
import {
  AppSidebar,
  type SidebarUser,
  type SidebarTenant,
} from "@/shared/components/AppSidebar";
import { useUIStore } from "@/shared/stores/ui.store";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  onLogout: () => void;
  me?: SidebarUser;
  isMeLoading?: boolean;
  tenants?: SidebarTenant[];
  selectedTenantSlug?: string | null;
  onTenantChange?: (slug: string) => void;
  isTenantsLoading?: boolean;
};

export function AppShell({
  children,
  title,
  onLogout,
  me,
  isMeLoading,
  tenants,
  selectedTenantSlug,
  onTenantChange,
  isTenantsLoading,
}: AppShellProps) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="flex min-h-screen bg-[var(--shop-bg-soft)]">
      <AppSidebar
        onLogout={onLogout}
        me={me}
        isMeLoading={isMeLoading}
        tenants={tenants}
        selectedTenantSlug={selectedTenantSlug}
        onTenantChange={onTenantChange}
        isTenantsLoading={isTenantsLoading}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 lg:hidden">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-2 text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title ? (
            <h1 className="shop-display text-base font-semibold uppercase tracking-wide text-[var(--shop-text)]">
              {title}
            </h1>
          ) : null}
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
