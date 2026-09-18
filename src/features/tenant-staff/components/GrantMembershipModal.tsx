"use client";

import { useState } from "react";
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";
import { assignableRoles } from "../lib/permissions";
import { roleOptions } from "../lib/presentation";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

const inputClass =
  "mb-4 w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2.5 text-sm text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)] disabled:opacity-60";

type GrantMembershipModalProps = {
  /** The caller's own tenant role — narrows which roles can be granted (OWNER: any; ADMIN_MANAGER: ADMIN only). */
  actingRole: string | null | undefined;
  /**
   * Present only when granting can target any store (the platform-wide
   * unified Staff & Roles page) — renders a "Store" picker above Role and
   * requires a selection before submit. Omitted entirely for the `/team`
   * page's call site, whose grant always targets the ambient tenant.
   */
  tenantOptions?: DropdownOption[];
  onClose: () => void;
  onGrant: (input: {
    email: string;
    role: string;
    tenantId?: string;
    name?: string;
    password?: string;
  }) => Promise<void>;
  isGranting: boolean;
};

/**
 * Grants a role to an account by email — instant, not an invite. Defaults to
 * assuming the account already exists; "Create a new account" reveals a
 * name/password pair so a brand-new account can be created and granted in
 * one step when the email doesn't match anyone yet (see
 * membership.service.ts's `newAccount` path — an existing account's own
 * password is never touched, even if these fields are filled in).
 */
export function GrantMembershipModal({
  actingRole,
  tenantOptions,
  onClose,
  onGrant,
  isGranting,
}: GrantMembershipModalProps) {
  const options = roleOptions(assignableRoles(actingRole));
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(
    options[options.length - 1]?.value ?? "ADMIN",
  );
  const [tenantId, setTenantId] = useState(tenantOptions?.[0]?.value ?? "");
  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit =
    email.trim().length > 0 &&
    (!tenantOptions || tenantId.length > 0) &&
    (!isNewUser || (name.trim().length > 0 && password.length >= 6));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await onGrant({
        email: email.trim(),
        role,
        ...(tenantOptions ? { tenantId } : {}),
        ...(isNewUser ? { name: name.trim(), password } : {}),
      });
      onClose();
    } catch {
      // Left open on failure — the mutation's own error toast already told
      // the admin what went wrong (e.g. "No account found for that email").
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Grant store access"
      subtitle={
        isNewUser
          ? "Creates a new account and grants it access in one step."
          : "Grants an existing account access — not an email invite."
      }
      maxWidthClassName="max-w-[420px]"
      bodyClassName="px-6 pb-6 pt-3"
      footer={
        <div className="flex items-center gap-2.5">
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            disabled={isGranting}
            className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="grant-membership-form"
            disabled={isGranting || !canSubmit}
            className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGranting ? "Granting…" : "Grant access"}
          </button>
        </div>
      }
    >
      <form id="grant-membership-form" onSubmit={handleSubmit}>
        {tenantOptions && (
          <>
            <label className={labelClass}>Store</label>
            <Dropdown
              value={tenantId}
              options={tenantOptions}
              onChange={setTenantId}
              disabled={isGranting}
              className="mb-4"
              aria-label="Store"
            />
          </>
        )}

        <label className={labelClass} htmlFor="grant-membership-email">
          Email
        </label>
        <input
          id="grant-membership-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isGranting}
          placeholder="person@example.com"
          className={inputClass}
        />

        <label className="mb-4 flex items-center gap-2.5 text-xs font-medium text-[var(--shop-text)]">
          <input
            type="checkbox"
            checked={isNewUser}
            onChange={(e) => setIsNewUser(e.target.checked)}
            disabled={isGranting}
            className="h-3.5 w-3.5 rounded border-[var(--shop-border)] accent-[var(--shop-accent)]"
          />
          This email doesn&apos;t have an account yet — create one
        </label>

        {isNewUser && (
          <>
            <label className={labelClass} htmlFor="grant-membership-name">
              Name
            </label>
            <input
              id="grant-membership-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isGranting}
              placeholder="Full name"
              className={inputClass}
            />

            <label className={labelClass} htmlFor="grant-membership-password">
              Password
            </label>
            <div className="relative mb-4">
              <input
                id="grant-membership-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isGranting}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2.5 pr-11 text-sm text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)] disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isGranting}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[var(--shop-text-muted)] transition hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </>
        )}

        <label className={labelClass}>Role</label>
        <Dropdown
          value={role}
          options={options}
          onChange={setRole}
          disabled={isGranting || options.length === 1}
          aria-label="Role"
        />
      </form>
    </Modal>
  );
}
