"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal as MoreHorizontalIcon } from "lucide-react";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import { useTenants } from "../hooks/useTenants";
import { TenantsTableSkeleton } from "./TenantsTableSkeleton";
import { TenantsStatsBar } from "./TenantsStatsBar";
import { TenantsFilterBar } from "./TenantsFilterBar";
import {
  avatarColor,
  initials,
  mockProductCount,
  statusStyle,
} from "../lib/presentation";

export function TenantsTable() {
  const router = useRouter();
  const { data: tenants, isLoading, error, refetch } = useTenants();
  const setTenantSlug = useTenantStore((s) => s.setTenantSlug);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!tenants) return [];
    return tenants.filter((t) => {
      if (statusFilter !== "all" && t.status.toLowerCase() !== statusFilter)
        return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.slug.toLowerCase().includes(q) &&
          !t.domain.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [tenants, search, statusFilter]);

  if (isLoading) {
    return <TenantsTableSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load tenants.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-xs font-semibold text-[var(--shop-accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-text-muted)]">
          No tenants provisioned yet.
        </p>
      </div>
    );
  }

  const switchToStore = (slug: string) => {
    setTenantSlug(slug);
    router.push("/dashboard");
  };

  const copyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    notify.success("Domain copied.");
    setOpenMenu(null);
  };

  const suspendStore = () => {
    notify.info("Suspending stores isn't available yet.");
    setOpenMenu(null);
  };

  return (
    <div>
      <TenantsStatsBar tenants={tenants} />
      <TenantsFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[2.2fr_1.4fr_0.8fr_1fr_1.4fr] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          <span>Store</span>
          <span>Domain</span>
          <span>Products</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
            No stores match your search.
          </p>
        ) : (
          filtered.map((t, i) => {
            const style = statusStyle(t.status);
            return (
              <div
                key={t.id}
                className="grid grid-cols-[2.2fr_1.4fr_0.8fr_1fr_1.4fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
                    style={{ background: avatarColor(i) }}
                  >
                    {initials(t.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--shop-text)]">
                      {t.name}
                    </p>
                    <p className="font-mono text-[11px] text-[var(--shop-text-muted)]">
                      {t.slug}
                    </p>
                  </div>
                </div>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {t.domain}
                </span>
                <span className="text-sm font-semibold text-[var(--shop-text)]">
                  {mockProductCount(t.id)}
                </span>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: style.bg, color: style.color }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: style.color }}
                  />
                  {t.status}
                </span>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => switchToStore(t.slug)}
                    className="text-xs font-semibold text-[var(--shop-accent)] hover:underline"
                  >
                    Manage store
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === t.id ? null : t.id)
                      }
                      aria-label={`Actions for ${t.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </button>
                    {openMenu === t.id && (
                      <div className="absolute right-0 top-8 z-10 w-[160px] rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1.5 shadow-lg">
                        <button
                          type="button"
                          onClick={() => copyDomain(t.domain)}
                          className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
                        >
                          Copy domain
                        </button>
                        <button
                          type="button"
                          onClick={suspendStore}
                          className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)]"
                        >
                          Suspend store
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
