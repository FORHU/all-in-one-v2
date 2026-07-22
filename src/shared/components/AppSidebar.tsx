"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shield, X } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/shared/navigation/nav-items";
import { useUIStore } from "@/shared/stores/ui.store";

type AppSidebarProps = {
  onLogout: () => void;
};

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#e5e7eb] bg-white transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#e5e7eb] px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]">
              <Shield className="h-4 w-4 text-white" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-[#111827]">Admin Central</p>
              <p className="text-[10px] font-medium text-[#9ca3af]">
                Management Suite
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-[#6b7280] hover:bg-[#f3f4f6] lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (sidebarOpen) toggleSidebar();
                    }}
                    className={[
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-[#eff6ff] text-[#2563eb]"
                        : "text-[#4b5563] hover:bg-[#f9fafb] hover:text-[#111827]",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-4 w-4 shrink-0",
                        active ? "text-[#2563eb]" : "text-[#9ca3af]",
                      ].join(" ")}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[#e5e7eb] p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#4b5563] transition hover:bg-[#fef2f2] hover:text-[#dc2626]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
