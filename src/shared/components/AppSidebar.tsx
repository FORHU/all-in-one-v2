"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Shield, X } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/shared/navigation/nav-items";
import { useUIStore } from "@/shared/stores/ui.store";

type AppSidebarProps = {
  onLogout: () => void;
};

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const item of ADMIN_NAV_ITEMS) {
        if (item.children && isNavItemActive(pathname, item.href)) {
          next[item.href] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpanded((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <>
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
              const active = isNavItemActive(pathname, item.href);
              const Icon = item.icon;
              const hasChildren = Boolean(item.children?.length);
              const isOpen = expanded[item.href] ?? active;

              return (
                <li key={item.href}>
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => {
                        const willOpen = !isOpen;
                        toggleExpanded(item.href);
                        if (willOpen) {
                          router.push(item.children![0].href);
                          if (sidebarOpen) toggleSidebar();
                        }
                      }}
                      className={[
                        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-[#eff6ff] text-[#2563eb]"
                          : "text-[#4b5563] hover:bg-[#f9fafb] hover:text-[#111827]",
                      ].join(" ")}
                      aria-expanded={isOpen}
                    >
                      <Icon
                        className={[
                          "h-4 w-4 shrink-0",
                          active ? "text-[#2563eb]" : "text-[#9ca3af]",
                        ].join(" ")}
                      />
                      <span className="min-w-0 flex-1 truncate text-left">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={[
                          "h-4 w-4 shrink-0 text-[#9ca3af] transition-transform",
                          isOpen ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    </button>
                  ) : (
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
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )}

                  {hasChildren && isOpen && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-[#e5e7eb] pl-3">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href;

                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => {
                                if (sidebarOpen) toggleSidebar();
                              }}
                              className={[
                                "block rounded-md px-3 py-2 text-sm transition",
                                childActive
                                  ? "font-medium text-[#2563eb]"
                                  : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]",
                              ].join(" ")}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
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
