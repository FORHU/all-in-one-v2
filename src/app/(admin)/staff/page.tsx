"use client";

import { useState } from "react";
import {
  StaffTable,
  type StaffEditInput,
} from "@/features/staff/components/StaffTable";
import {
  useUsers,
  useUpdateUser,
  useRemoveUser,
} from "@/features/users/hooks/useUsers";
import { useMe } from "@/features/auth/hooks/useAuth";
import { notify } from "@/shared/lib/notify";

// Staff & Roles only manages staff-tier accounts — plain "USER" accounts
// (customers) come back from the same endpoint but don't belong here.
const STAFF_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "DEVELOPER"]);

// GET /api/v2/users' `role` filter only accepts a single value, so there's no
// one-call way to ask the backend for "any of ADMIN/SUPER_ADMIN/DEVELOPER" —
// this page has to fetch the combined staff+customer roster and filter down
// client-side. `limit` is clamped server-side to `maxLimit` in
// all-in-one-v2-api/src/helpers/pagination.helper.ts (100, not the 200 this
// page used to ask for — the old value silently under-fetched even before
// hitting the truncation this fixes). Paginating on the backend's real
// page/totalPages instead of a client-side cap means that once the combined
// roster outgrows one page, admins get a working pager instead of staff
// quietly disappearing.
const PAGE_SIZE = 100;

export default function StaffPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useUsers({
    page,
    limit: PAGE_SIZE,
  });
  const { data: me } = useMe();
  const updateUser = useUpdateUser();
  const removeUser = useRemoveUser();

  const handleSaveEdit = async (id: string, input: StaffEditInput) => {
    await updateUser.mutateAsync({ id, data: input });
    notify.success("Staff account updated.");
  };

  const handleRemove = async (id: string) => {
    await removeUser.mutateAsync(id);
    notify.success("Staff account removed.");
  };

  const staffAccounts = data?.items
    .filter((u) => STAFF_ROLES.has(u.role))
    .map((u) => ({
      id: u.id,
      name: u.name ?? u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <StaffTable
        heading={{ title: "Staff & Roles" }}
        accounts={staffAccounts}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onInvite={() => notify.info("Inviting staff isn't wired up yet.")}
        currentUserId={me?.id}
        onSaveEdit={handleSaveEdit}
        savingId={updateUser.isPending ? updateUser.variables?.id : null}
        onRemove={handleRemove}
        removingId={removeUser.isPending ? removeUser.variables : null}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
