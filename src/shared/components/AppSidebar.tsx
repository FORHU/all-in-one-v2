"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe, LogOut, Shield, X } from "lucide-react";
import { getNavItems } from "@/shared/navigation/nav-items";
import { useUIStore } from "@/shared/stores/ui.store";
import { notify } from "@/shared/lib/notify";

// shared/ is pure infrastructure and may not import from features/ — the
// caller (AdminLayout) fetches the profile and passes it down as data.
export type SidebarUser = {
  name: string | null;
  username: string;
  email: string;
};

// Same rule applies to the tenant list — AdminLayout fetches it (features/tenants)
// and passes plain data down, so this component never imports a feature.
export type SidebarTenant = {
  slug: string;
  name: string;
};

type AppSidebarProps = {
  onLogout: () => void;
  me?: SidebarUser;
  isMeLoading?: boolean;
  tenants?: SidebarTenant[];
  selectedTenantSlug?: string | null;
  onTenantChange?: (slug: string) => void;
  isTenantsLoading?: boolean;
};

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Deterministic per-store color so a given tenant always gets the same
// avatar chip — makes the switcher's current selection recognizable by
// color, not just by reading text. Dedicated --shop-avatar-* tokens, not the
// semantic status palette, so a tenant's chip is never mistaken for a status
// badge (see theme.css).
const TENANT_AVATAR_PALETTE = [
  "var(--shop-avatar-1)",
  "var(--shop-avatar-2)",
  "var(--shop-avatar-3)",
  "var(--shop-avatar-4)",
  "var(--shop-avatar-5)",
];

function tenantAvatarColor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return TENANT_AVATAR_PALETTE[hash % TENANT_AVATAR_PALETTE.length];
}

function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w));
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function AppSidebar({
  onLogout,
  me,
  isMeLoading,
  tenants,
  selectedTenantSlug,
  onTenantChange,
  isTenantsLoading,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [justSwitched, setJustSwitched] = useState(false);
  const switchPulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tenantMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (switchPulseTimeout.current) clearTimeout(switchPulseTimeout.current);
    };
  }, []);

  // Native <select> gets Escape-to-close for free; this custom dropdown has
  // to wire it up itself, and return focus to the trigger so keyboard users
  // aren't left with focus stranded on a closed panel.
  useEffect(() => {
    if (!tenantMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTenantMenuOpen(false);
        tenantMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [tenantMenuOpen]);

  // `token` (and therefore the caller's profile query) is only known after
  // mount — the server always renders as logged-out, since localStorage
  // doesn't exist there. Gating on `mounted` keeps the first client render
  // identical to the server's, avoiding a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // `selectedTenantSlug` reads localStorage, which the server always sees
  // as unset — before mount, render as Platform scope (the server's view)
  // so the first client paint matches and avoids a hydration mismatch.
  const isPlatformScope = !mounted || !selectedTenantSlug;
  const navItems = getNavItems(isPlatformScope);
  const selectedTenant = tenants?.find((t) => t.slug === selectedTenantSlug);
  const currentTenantLabel = isPlatformScope
    ? "Platform (All Stores)"
    : (selectedTenant?.name ?? "Select store");
  const currentChipColor = isPlatformScope
    ? "var(--shop-band-text-muted)"
    : tenantAvatarColor(selectedTenantSlug ?? "");

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const item of navItems) {
        if (item.children && isNavItemActive(pathname, item.href)) {
          next[item.href] = true;
        }
      }
      return next;
    });
  }, [pathname, navItems]);

  const toggleExpanded = (href: string) => {
    setExpanded((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  // Switching scope can strand the user on a page that doesn't exist in the
  // new nav (e.g. Platform's /tenants isn't a store page) — the URL doesn't
  // change on its own just because the sidebar's item list did. Redirect to
  // /dashboard, which exists in both scopes, when that happens.
  const handleTenantChange = (slug: string, label: string) => {
    setTenantMenuOpen(false);
    if (slug === (selectedTenantSlug ?? "")) return;
    onTenantChange?.(slug);

    // Platform <-> store swaps the entire nav item list (see the fade below),
    // so that change is already unmistakable. Store-to-store swaps keep the
    // exact same nav list — only the chip color/label change — which is the
    // genuinely ambiguous case, so that's where the toast earns its keep.
    const switchingScope = isPlatformScope !== !slug;
    if (!switchingScope) {
      notify.success(`Now viewing ${label}`, { id: "tenant-switch" });
    }

    setJustSwitched(true);
    if (switchPulseTimeout.current) clearTimeout(switchPulseTimeout.current);
    switchPulseTimeout.current = setTimeout(() => setJustSwitched(false), 550);

    const nextNavItems = getNavItems(!slug);
    const stillValid = nextNavItems.some(
      (item) =>
        isNavItemActive(pathname, item.href) ||
        item.children?.some((c) => isNavItemActive(pathname, c.href)),
    );
    if (!stillValid) {
      router.push("/dashboard");
    }
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
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[var(--shop-ink)] transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--shop-accent)]">
              <Shield
                className="h-4 w-4 text-[var(--shop-ink)]"
                strokeWidth={2.25}
              />
            </div>
            <div className="leading-tight">
              <p className="shop-display text-sm font-bold uppercase tracking-wide text-[var(--shop-band-text)]">
                Admin Central
              </p>
              <p className="text-[10px] font-medium text-[var(--shop-band-text-muted)]">
                Management Suite
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-[var(--shop-band-text-muted)] hover:bg-white/5 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative border-b border-white/10 px-3 py-3">
          {mounted && isTenantsLoading ? (
            <div className="h-11 animate-pulse rounded-md bg-white/5" />
          ) : mounted && tenants && tenants.length > 0 ? (
            <>
              {tenantMenuOpen && (
                <button
                  type="button"
                  aria-label="Close store switcher"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setTenantMenuOpen(false)}
                />
              )}

              <button
                ref={tenantMenuButtonRef}
                type="button"
                onClick={() => setTenantMenuOpen((v) => !v)}
                aria-label="Switch store"
                aria-expanded={tenantMenuOpen}
                className={[
                  "relative z-50 flex w-full items-center gap-2.5 rounded-md bg-white/5 px-2.5 py-2 text-left transition hover:bg-white/[0.08]",
                  justSwitched ? "shop-tenant-switch-pulse" : "",
                ].join(" ")}
                style={
                  {
                    "--shop-pulse-color": currentChipColor,
                  } as React.CSSProperties
                }
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                  style={{ background: currentChipColor }}
                >
                  {isPlatformScope ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    initials(selectedTenant?.name ?? "")
                  )}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-semibold text-[var(--shop-band-text)]">
                    {currentTenantLabel}
                  </p>
                  <p className="truncate text-[10px] font-medium uppercase tracking-wide text-[var(--shop-band-text-muted)]">
                    {isPlatformScope ? "Platform scope" : "Store scope"}
                  </p>
                </div>
                <ChevronDown
                  className={[
                    "h-3.5 w-3.5 shrink-0 text-[var(--shop-band-text-muted)] transition-transform",
                    tenantMenuOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {tenantMenuOpen && (
                <div className="shop-scope-fade absolute left-3 right-3 top-[calc(100%-4px)] z-50 max-h-72 overflow-y-auto rounded-md border border-white/10 bg-[var(--shop-ink-soft)] p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() =>
                      handleTenantChange("", "Platform (All Stores)")
                    }
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-white/5"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--shop-band-text-muted)] text-white">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--shop-band-text)]">
                      Platform (All Stores)
                    </span>
                    {isPlatformScope && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[var(--shop-accent)]" />
                    )}
                  </button>
                  {tenants.map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => handleTenantChange(t.slug, t.name)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-white/5"
                    >
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                        style={{ background: tenantAvatarColor(t.slug) }}
                      >
                        {initials(t.name)}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--shop-band-text)]">
                        {t.name}
                      </span>
                      {!isPlatformScope && selectedTenantSlug === t.slug && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-[var(--shop-accent)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul
            key={isPlatformScope ? "platform" : "store"}
            className="shop-scope-fade space-y-0.5"
          >
            {navItems.map((item) => {
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
                        "flex w-full items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "border-[var(--shop-accent)] bg-white/5 text-[var(--shop-band-text)]"
                          : "border-transparent text-[var(--shop-band-text-muted)] hover:bg-white/5 hover:text-[var(--shop-band-text)]",
                      ].join(" ")}
                      aria-expanded={isOpen}
                    >
                      <Icon
                        className={[
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-[var(--shop-accent)]"
                            : "text-[var(--shop-band-text-muted)]",
                        ].join(" ")}
                      />
                      <span className="min-w-0 flex-1 truncate text-left">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={[
                          "h-4 w-4 shrink-0 text-[var(--shop-band-text-muted)] transition-transform",
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
                        "flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "border-[var(--shop-accent)] bg-white/5 text-[var(--shop-band-text)]"
                          : "border-transparent text-[var(--shop-band-text-muted)] hover:bg-white/5 hover:text-[var(--shop-band-text)]",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-[var(--shop-accent)]"
                            : "text-[var(--shop-band-text-muted)]",
                        ].join(" ")}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )}

                  {hasChildren && isOpen && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
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
                                  ? "font-medium text-[var(--shop-accent)]"
                                  : "text-[var(--shop-band-text-muted)] hover:bg-white/5 hover:text-[var(--shop-band-text)]",
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

        <div className="border-t border-white/10 p-3">
          {mounted && isMeLoading ? (
            <div className="mb-1 h-11 animate-pulse rounded-md bg-white/5" />
          ) : mounted && me ? (
            <div className="mb-1 flex items-center gap-3 rounded-md px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-[var(--shop-band-text)]">
                {(me.name ?? me.username).charAt(0)}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium text-[var(--shop-band-text)]">
                  {me.name ?? me.username}
                </p>
                <p className="truncate text-[11px] text-[var(--shop-band-text-muted)]">
                  {me.email}
                </p>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[var(--shop-band-text-muted)] transition hover:bg-white/5 hover:text-[var(--shop-accent)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
