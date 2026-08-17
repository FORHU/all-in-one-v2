import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard as LayoutDashboardIcon,
  Package as PackageIcon,
  ShoppingCart as ShoppingCartIcon,
  Truck as TruckIcon,
  Settings as SettingsIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Every Store. One Panel.",
  description:
    "Orders, catalog, suppliers and marketing across every storefront you run — synced automatically and managed from a single dashboard.",
};

const CAPABILITIES = [
  "Multi-store orders",
  "Supplier sync",
  "Unified catalog",
  "AI marketing tools",
];

const MOCK_NAV_ICONS = [
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  TruckIcon,
  SettingsIcon,
];

const MOCK_CHART_BARS = [40, 65, 35, 80, 55, 92, 50];

const MOCK_ROWS = [
  { status: "success" as const },
  { status: "warning" as const },
  { status: "success" as const },
];

function DashboardMockup() {
  return (
    <div className="mx-auto w-full max-w-[440px] rounded-2xl border border-[var(--shop-band-text)]/10 bg-[var(--shop-ink-soft)] p-4 shadow-2xl lg:mx-0">
      {/* window chrome */}
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--shop-band-text)]/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--shop-band-text)]/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--shop-band-text)]/15" />
        <div className="ml-3 h-2 max-w-[140px] flex-1 rounded-full bg-[var(--shop-band-text)]/10" />
      </div>

      <div className="flex gap-4">
        {/* sidebar */}
        <div className="flex flex-col gap-2 border-r border-[var(--shop-band-text)]/10 pr-3">
          {MOCK_NAV_ICONS.map((Icon, i) => (
            <div
              key={i}
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                i === 0
                  ? "bg-[var(--shop-accent)] text-[var(--shop-ink)]"
                  : "text-[var(--shop-band-text)]/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
          ))}
        </div>

        {/* content */}
        <div className="flex-1 space-y-3">
          {/* stat cards */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--shop-band-text)]/10 bg-[var(--shop-band-text)]/5 p-2.5"
              >
                <div className="h-1.5 w-7 rounded-full bg-[var(--shop-band-text)]/20" />
                <div className="mt-2 h-3 w-10 rounded-full bg-[var(--shop-band-text)]/40" />
              </div>
            ))}
          </div>

          {/* bar chart */}
          <div className="flex h-20 items-end gap-1.5 rounded-lg border border-[var(--shop-band-text)]/10 bg-[var(--shop-band-text)]/5 p-3">
            {MOCK_CHART_BARS.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${
                  i === 5
                    ? "bg-[var(--shop-accent)]"
                    : "bg-[var(--shop-band-text)]/25"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* table rows */}
          <div className="space-y-2">
            {MOCK_ROWS.map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-[var(--shop-band-text)]/10 bg-[var(--shop-band-text)]/5 p-2"
              >
                <div className="h-6 w-6 rounded-full bg-[var(--shop-band-text)]/15" />
                <div className="h-2 max-w-[90px] flex-1 rounded-full bg-[var(--shop-band-text)]/20" />
                <div
                  className={`h-4 w-14 rounded-full ${
                    row.status === "success"
                      ? "bg-[var(--shop-success)]/25"
                      : "bg-[var(--shop-warning)]/25"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--shop-ink)] text-[var(--shop-band-text)]">
      <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-14 py-7">
        <span className="shop-display text-lg font-bold uppercase tracking-[0.08em]">
          All In One
        </span>
        <Link
          href="/login"
          className="shop-display rounded-full border border-[var(--shop-band-text)]/25 px-[22px] py-[10px] text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150 hover:bg-[var(--shop-band-text)]/8"
        >
          Sign In
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 items-center px-14 py-10 pb-20">
        <div className="grid w-full items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-7 text-center lg:items-start lg:text-left">
            <span className="shop-display inline-block rounded-full bg-[var(--shop-accent)]/12 px-4 py-[7px] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shop-accent)]">
              For agencies running multiple stores
            </span>

            <h1
              className="shop-display m-0 font-bold uppercase tracking-[-0.01em]"
              style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 0.98 }}
            >
              Every Store.
              <br />
              One Panel.
            </h1>

            <p className="m-0 max-w-[480px] text-[19px] leading-[1.55] text-[var(--shop-band-text)]/65">
              Orders, catalog, suppliers and marketing across every storefront
              you run — synced automatically and managed from a single
              dashboard, instead of a dozen separate admin logins.
            </p>

            <div className="mt-2 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                href="/login"
                className="shop-display rounded-full bg-[var(--shop-band-text)] px-8 py-[15px] text-sm font-semibold uppercase tracking-[0.05em] text-[var(--shop-ink)] transition-colors duration-150 hover:bg-[#e8e4de]"
              >
                Sign In to Your Dashboard
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-9 text-[var(--shop-band-text)]/40 lg:justify-start">
              {CAPABILITIES.map((label) => (
                <span
                  key={label}
                  className="shop-display text-xs font-semibold uppercase tracking-[0.08em]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <DashboardMockup />
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[1280px] items-center justify-between border-t border-[var(--shop-band-text)]/10 px-14 py-6 text-[13px] text-[var(--shop-band-text)]/40">
        <span>© {new Date().getFullYear()} All In One</span>
        <span className="shop-display text-[11px] font-semibold uppercase tracking-[0.1em]">
          Admin Central
        </span>
      </footer>
    </div>
  );
}
