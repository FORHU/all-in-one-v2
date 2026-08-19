"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle as AlertTriangleIcon,
  RotateCw as RotateCwIcon,
  Store as StoreIcon,
} from "lucide-react";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import { useTenants } from "../hooks/useTenants";
import { TenantsTableSkeleton } from "./TenantsTableSkeleton";
import { TenantsStatsBar } from "./TenantsStatsBar";
import { TenantsFilterBar } from "./TenantsFilterBar";
import { TenantRow } from "./TenantRow";
import { TENANT_GRID_COLS } from "../lib/presentation";

export function TenantsTable() {
  const router = useRouter();
  const { data: tenants, isLoading, error, refetch } = useTenants();
  const setTenantSlug = useTenantStore((s) => s.setTenantSlug);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

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
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center"
      >
        <AlertTriangleIcon
          className="h-5 w-5"
          style={{ color: "var(--shop-danger)" }}
          strokeWidth={2.25}
        />
        <p className="text-sm font-semibold text-[var(--shop-text)]">
          Couldn&apos;t load tenants
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <RotateCwIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Try again
        </button>
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <StoreIcon
          className="h-8 w-8 text-[var(--shop-text-muted)]"
          strokeWidth={1.5}
        />
        <p className="text-sm font-semibold text-[var(--shop-text)]">
          No stores provisioned yet.
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
        <div
          className={`grid items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)] ${TENANT_GRID_COLS}`}
        >
          <span>Store</span>
          <span>Domain</span>
          <span>Products</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-[18px] py-14 text-center">
            <StoreIcon
              className="h-8 w-8 text-[var(--shop-text-muted)]"
              strokeWidth={1.5}
            />
            <p className="text-sm font-semibold text-[var(--shop-text)]">
              No stores match these filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[var(--shop-border)] px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text)] transition hover:bg-[var(--shop-bg-soft)]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((t, i) => (
            <TenantRow
              key={t.id}
              tenant={t}
              avatarIndex={i}
              isMenuOpen={openMenu === t.id}
              onToggleMenu={() => setOpenMenu(openMenu === t.id ? null : t.id)}
              onManageStore={() => switchToStore(t.slug)}
              onCopyDomain={() => copyDomain(t.domain)}
              onSuspend={suspendStore}
            />
          ))
        )}
      </div>
    </div>
  );
}
