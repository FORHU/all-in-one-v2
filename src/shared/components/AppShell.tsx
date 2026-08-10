"use client";

import { Menu as MenuIcon } from "lucide-react";
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
    <div className="flex h-dvh overflow-hidden bg-[var(--shop-bg-soft)]">
      <AppSidebar
        onLogout={onLogout}
        me={me}
        isMeLoading={isMeLoading}
        tenants={tenants}
        selectedTenantSlug={selectedTenantSlug}
        onTenantChange={onTenantChange}
        isTenantsLoading={isTenantsLoading}
      />

      {/* overflow-hidden here (not just on <main>) so this column's height
          stays clamped to the shell's h-dvh instead of growing to fit tall
          page content — without it, the browser's automatic min-height for
          flex items would still let the whole shell (and the sidebar with
          it) push past the viewport and scroll as one document. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 lg:hidden">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-2 text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)] lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          {title ? (
            <h1 className="shop-display text-base font-semibold uppercase tracking-wide text-[var(--shop-text)]">
              {title}
            </h1>
          ) : null}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div
            key={selectedTenantSlug ?? "platform"}
            className="shop-content-fade"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
