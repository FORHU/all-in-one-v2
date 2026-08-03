"use client";

import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 20%, rgba(255,61,110,0.06), transparent 45%), radial-gradient(circle at 85% 80%, rgba(27,23,48,0.05), transparent 45%)",
      }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-xl md:grid-cols-2">
        {/* Left panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--shop-ink)] p-10 text-[var(--shop-band-text)] md:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--shop-accent)]/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-white/5 blur-2xl" />

          <span className="relative shop-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shop-band-text-muted)]">
            Admin Central
          </span>

          <div className="relative">
            <span className="mb-3.5 inline-block rounded-full bg-[var(--shop-accent)]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-accent)]">
              Admin access
            </span>
            <h1 className="shop-display max-w-sm text-4xl font-bold uppercase leading-[0.95] tracking-tight">
              All In One, Managed From One Place
            </h1>
            <p className="mt-4 max-w-sm text-sm text-[var(--shop-band-text-muted)]">
              Manage every storefront, order and product catalog from a single,
              unified dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3.5">
              {[
                "Unified catalog across every supplier",
                "Orders, returns and fulfillment in one queue",
                "Live revenue and inventory reporting",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md bg-white/10 text-[var(--shop-accent)]">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-[13px] text-[var(--shop-band-text-muted)]">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <span className="relative text-xs text-[var(--shop-band-text-muted)]">
            © {new Date().getFullYear()} All In One
          </span>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
