"use client";

import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { useUsers } from "@/features/users/hooks/useUsers";

export default function CustomersPage() {
  const { data, isLoading, isError, error, refetch } = useUsers();

  const customerAccounts = data
    ?.filter((u) => u.role === "USER")
    .map((u) => ({
      id: u.id,
      name: u.name ?? u.username,
      email: u.email,
      isActive: u.isActive,
      isEmailVerified: u.isEmailVerified,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            Customers
          </h2>
          <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
            View customer profiles and account activity across the platform.
          </p>
        </div>
      </div>
      <CustomersTable
        accounts={customerAccounts}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
}
