"use client";

import { Menu } from "lucide-react";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { useUIStore } from "@/shared/stores/ui.store";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  onLogout: () => void;
};

export function AppShell({ children, title, onLogout }: AppShellProps) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <AppSidebar onLogout={onLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#e5e7eb] bg-white px-4 lg:px-6">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-2 text-[#4b5563] hover:bg-[#f3f4f6] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title ? (
            <h1 className="text-base font-semibold text-[#111827]">{title}</h1>
          ) : null}
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
