"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { Dropdown } from "@/shared/components/Dropdown";
import { ConfirmBar } from "@/shared/components/ConfirmBar";
import { STAFF_ROLE_OPTIONS } from "../lib/presentation";
import type { StaffAccount, StaffEditInput } from "./StaffTable";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

type StaffAccountModalProps = {
  account: StaffAccount;
  /** Hides/disables Remove — mirrors the backend's guard against removing your own account. */
  isSelf: boolean;
  onClose: () => void;
  onSave: (id: string, data: StaffEditInput) => Promise<void>;
  isSaving: boolean;
  onRemove: (id: string) => Promise<void>;
  isRemoving: boolean;
};

/**
 * Single entry point for everything the Staff table's row action opens —
 * edit (role/active) and remove — replacing what used to be a small
 * dropdown menu. The dropdown sat inside the table's `overflow-hidden`
 * wrapper (needed elsewhere to keep the header/rows clipped to its rounded
 * corners) and got visibly clipped for any row near the table's edge; a
 * modal, like the rest of this admin panel's edit flows, is immune to that
 * since it renders full-screen rather than anchored to the row.
 */
export function StaffAccountModal({
  account,
  isSelf,
  onClose,
  onSave,
  isSaving,
  onRemove,
  isRemoving,
}: StaffAccountModalProps) {
  const [role, setRole] = useState(account.role);
  const [isActive, setIsActive] = useState(account.isActive);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const dirty = role !== account.role || isActive !== account.isActive;
  const busy = isSaving || isRemoving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    try {
      await onSave(account.id, { role, isActive });
      onClose();
    } catch {
      // Left open on failure — the mutation's own error toast already told
      // the admin what went wrong; the draft stays so they don't retype it.
    }
  };

  const handleConfirmRemove = async () => {
    try {
      await onRemove(account.id);
      onClose();
    } catch {
      setConfirmingRemove(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Staff account"
      subtitle={`${account.name} · ${account.email}`}
      maxWidthClassName="max-w-[420px]"
      // Less top padding than the default — the Role dropdown's open panel
      // (3 options) needs room below the trigger before the modal's own
      // `max-h-[92vh]` forces the body itself to scroll to reveal it.
      bodyClassName="px-6 pb-6 pt-3"
      footer={
        confirmingRemove ? (
          <ConfirmBar
            className="rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4"
            message={
              <>Remove {account.name}? This can&apos;t be undone from here.</>
            }
            cancelLabel="Keep them"
            confirmLabel="Remove permanently"
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
              title={isSelf ? "You can't remove your own account" : undefined}
              className="rounded-lg border border-[var(--shop-danger)]/30 px-4 py-2.5 text-[13px] font-bold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove staff
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
              form="staff-account-form"
              disabled={busy || !dirty}
              className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        )
      }
    >
      <form id="staff-account-form" onSubmit={handleSubmit}>
        <label className={labelClass}>Role</label>
        <Dropdown
          value={role}
          options={STAFF_ROLE_OPTIONS}
          onChange={setRole}
          disabled={busy}
          className="mb-4"
          aria-label="Role"
        />

        {/* Same status-switch convention as CollectionFormModal's isPublic
            toggle — the whole block's border/background/copy carries the
            state, not just the small pill inside it. A pill alone (tried
            first) reads as barely-there in its "off" position: --shop-border
            is a ~12%-opacity hairline tint, not a fill color, so a white
            knob on it all but disappears against the modal's white surface. */}
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive(!isActive)}
          // Deactivating yourself locks you out immediately — login rejects
          // isActive: false — and unlike a wrong role, there's no self-service
          // way back in. Only reachable while currently active, since an
          // inactive account couldn't have opened this modal to reactivate
          // itself in the first place.
          disabled={busy || (isSelf && isActive)}
          title={
            isSelf && isActive
              ? "You can't deactivate your own account"
              : undefined
          }
          className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isActive
              ? "border-[var(--shop-success)]/30 bg-[var(--shop-success-bg)]"
              : "border-[var(--shop-border)] bg-[var(--shop-bg-soft)]"
          }`}
        >
          <span>
            <span className="block text-xs font-bold text-[var(--shop-text)]">
              {isActive ? "Active" : "Inactive"}
            </span>
            <span className="mt-0.5 block text-[10.5px] text-[var(--shop-text-muted)]">
              {isSelf && isActive
                ? "You can't deactivate your own account."
                : isActive
                  ? "Can sign in right now."
                  : "Can't sign in while inactive."}
            </span>
          </span>
          <span
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              isActive ? "bg-[var(--shop-success)]" : "bg-[var(--shop-border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                isActive ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
      </form>
    </Modal>
  );
}
