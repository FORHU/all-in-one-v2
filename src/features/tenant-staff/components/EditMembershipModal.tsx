"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { Dropdown } from "@/shared/components/Dropdown";
import { ConfirmBar } from "@/shared/components/ConfirmBar";
import { assignableRoles } from "../lib/permissions";
import { roleOptions, displayRole } from "../lib/presentation";
import type { TenantMembership } from "../contracts/tenant-staff.contract";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

type EditMembershipModalProps = {
  membership: TenantMembership;
  actingRole: string | null | undefined;
  /** True for the signed-in user's own row — mirrors the backend's self-lockout (an ADMIN_MANAGER can never touch its own row; an OWNER can, but loses last-owner protection elsewhere). */
  isSelf: boolean;
  onClose: () => void;
  onSave: (id: string, role: string) => Promise<void>;
  isSaving: boolean;
  onRemove: (id: string) => Promise<void>;
  isRemoving: boolean;
};

export function EditMembershipModal({
  membership,
  actingRole,
  isSelf,
  onClose,
  onSave,
  isSaving,
  onRemove,
  isRemoving,
}: EditMembershipModalProps) {
  const options = roleOptions(
    Array.from(new Set([...assignableRoles(actingRole), membership.role])),
  );
  const [role, setRole] = useState(membership.role);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const dirty = role !== membership.role;
  const busy = isSaving || isRemoving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    try {
      await onSave(membership.id, role);
      onClose();
    } catch {
      // Left open on failure — the mutation's own error toast already
      // explained what went wrong (e.g. "You cannot modify this member's role").
    }
  };

  const handleConfirmRemove = async () => {
    try {
      await onRemove(membership.id);
      onClose();
    } catch {
      setConfirmingRemove(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Store member"
      subtitle={`${membership.user.name ?? membership.user.username} · ${membership.user.email}`}
      maxWidthClassName="max-w-[420px]"
      bodyClassName="px-6 pb-6 pt-3"
      footer={
        confirmingRemove ? (
          <ConfirmBar
            className="rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4"
            message={
              <>
                Remove {membership.user.name ?? membership.user.email}&apos;s
                access to this store?
              </>
            }
            cancelLabel="Keep them"
            confirmLabel="Remove access"
            pendingLabel="Removing…"
            onCancel={() => setConfirmingRemove(false)}
            onConfirm={handleConfirmRemove}
            isPending={isRemoving}
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              disabled={busy || isSelf}
              title={isSelf ? "You can't remove your own access" : undefined}
              className="rounded-lg border border-[var(--shop-danger)]/30 px-4 py-2.5 text-[13px] font-bold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove access
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-membership-form"
              disabled={busy || !dirty}
              className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        )
      }
    >
      <form id="edit-membership-form" onSubmit={handleSubmit}>
        <label className={labelClass}>Role</label>
        <Dropdown
          value={role}
          options={options}
          onChange={setRole}
          disabled={busy || options.length === 1}
          aria-label="Role"
        />
        {options.length === 1 && (
          <p className="mt-2 text-[11px] text-[var(--shop-text-muted)]">
            You can&apos;t change a {displayRole(membership.role)}&apos;s role.
          </p>
        )}
      </form>
    </Modal>
  );
}
