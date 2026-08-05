"use client";

import { Plus as PlusIcon } from "lucide-react";
import { TenantsTable } from "@/features/tenants/components/TenantsTable";
import { notify } from "@/shared/lib/notify";

export default function TenantsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Tenants
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            Every store hosted on the platform. Pick one to manage its catalog,
            orders, and settings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => notify.info("Store provisioning isn't available yet.")}
          className="flex items-center gap-1.5 rounded-full bg-[var(--shop-accent-dark)] px-4 py-2.5 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 active:scale-[0.99]"
        >
          <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
          Add Store
        </button>
      </div>
      <TenantsTable />
    </div>
  );
}
