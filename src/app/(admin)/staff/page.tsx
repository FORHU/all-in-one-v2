"use client";

import { UserPlus } from "lucide-react";
import { StaffTable } from "@/features/staff/components/StaffTable";
import { notify } from "@/shared/lib/notify";

export default function StaffPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Staff & Roles
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            Manage admin, developer, and super-admin accounts across the
            platform.
          </p>
        </div>
        <button
          type="button"
          onClick={() => notify.info("Inviting staff isn't wired up yet.")}
          className="flex items-center gap-1.5 rounded-full bg-[var(--shop-accent-dark)] px-4 py-2.5 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 active:scale-[0.99]"
        >
          <UserPlus className="h-4 w-4" strokeWidth={2.5} />
          Invite Staff
        </button>
      </div>
      <StaffTable />
    </div>
  );
}
