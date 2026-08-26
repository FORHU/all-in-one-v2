"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal as MoreHorizontalIcon } from "lucide-react";
import { ConfirmBar } from "@/shared/components/ConfirmBar";
import type { Tenant } from "../contracts/tenants.contract";
import {
  TENANT_GRID_COLS,
  avatarColor,
  initials,
  statusStyle,
} from "../lib/presentation";

// Rough height of the actions menu — sized for the taller of the two states
// it can show (the suspend/reactivate confirm banner, not just the 2 plain
// items) — used to decide whether it has room to open downward before it's
// even rendered, since the table's rounded-corner container clips anything
// that would render outside it.
const MENU_HEIGHT_ESTIMATE = 140;

type TenantRowProps = {
  tenant: Tenant;
  avatarIndex: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onManageStore: () => void;
  onCopyDomain: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
  /** Shared mutation pending flag — only meaningful for the one row whose menu is open, since only one menu can be open at a time. */
  isUpdatingStatus: boolean;
};

export function TenantRow({
  tenant,
  avatarIndex,
  isMenuOpen,
  onToggleMenu,
  onManageStore,
  onCopyDomain,
  onSuspend,
  onReactivate,
  isUpdatingStatus,
}: TenantRowProps) {
  const style = statusStyle(tenant.status);
  const isActive = tenant.status.toUpperCase() === "ACTIVE";
  const isSuspended = tenant.status.toUpperCase() === "SUSPENDED";

  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const [menuOpensUpward, setMenuOpensUpward] = useState(false);
  // Confirm-before-you-fire banner for the suspend/reactivate action — same
  // swap-in-place convention as BrandActionsModal/StaffAccountModal's
  // danger-confirm footers, adapted to this row's small actions menu instead
  // of a modal footer.
  const [confirmingStatusChange, setConfirmingStatusChange] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) setConfirmingStatusChange(false);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggleMenu();
        menuTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, onToggleMenu]);

  const handleToggleMenu = () => {
    if (!isMenuOpen && menuTriggerRef.current) {
      const { bottom } = menuTriggerRef.current.getBoundingClientRect();
      setMenuOpensUpward(window.innerHeight - bottom < MENU_HEIGHT_ESTIMATE);
    }
    onToggleMenu();
  };

  const handleConfirmStatusChange = () => {
    if (isActive) {
      onSuspend();
    } else if (isSuspended) {
      onReactivate();
    }
  };

  return (
    <div
      className={`grid items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0 ${TENANT_GRID_COLS}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
          style={{ background: avatarColor(avatarIndex) }}
        >
          {initials(tenant.name)}
        </div>
        <div className="min-w-0">
          <button
            type="button"
            onClick={onManageStore}
            className="block w-full truncate rounded text-left text-sm font-semibold text-[var(--shop-text)] hover:text-[var(--shop-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shop-accent)] focus-visible:ring-offset-1"
          >
            {tenant.name}
          </button>
          <p className="font-mono text-[11px] text-[var(--shop-text-muted)]">
            {tenant.slug}
          </p>
        </div>
      </div>
      <span className="truncate text-xs text-[var(--shop-text-muted)]">
        {tenant.domain}
      </span>
      <span className="text-sm font-semibold text-[var(--shop-text)]">
        {tenant.productCount}
      </span>
      <span
        className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
        style={{ background: style.bg, color: style.color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: style.color }}
        />
        {tenant.status}
      </span>
      <div className="flex items-center justify-end">
        <div className="relative">
          <button
            ref={menuTriggerRef}
            type="button"
            onClick={handleToggleMenu}
            aria-label={`Actions for ${tenant.name}`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={onToggleMenu}
              />
              <div
                role="menu"
                aria-label={`Actions for ${tenant.name}`}
                className={[
                  "absolute right-0 z-50 rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-lg",
                  confirmingStatusChange
                    ? "w-[220px] p-2.5"
                    : "w-[160px] p-1.5",
                  menuOpensUpward ? "bottom-8" : "top-8",
                ].join(" ")}
              >
                {confirmingStatusChange ? (
                  <ConfirmBar
                    size="sm"
                    variant={isActive ? "danger" : "success"}
                    message={
                      isActive
                        ? `Suspend ${tenant.name}? Its storefront goes offline immediately.`
                        : `Reactivate ${tenant.name}? Its storefront goes back online immediately.`
                    }
                    cancelLabel={isActive ? "Keep it live" : "Cancel"}
                    confirmLabel={isActive ? "Suspend" : "Reactivate"}
                    pendingLabel="Working…"
                    onCancel={() => setConfirmingStatusChange(false)}
                    onConfirm={handleConfirmStatusChange}
                    isPending={isUpdatingStatus}
                  />
                ) : (
                  <>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={onCopyDomain}
                      className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
                    >
                      Copy domain
                    </button>
                    {isActive && (
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => setConfirmingStatusChange(true)}
                        className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)]"
                      >
                        Suspend store
                      </button>
                    )}
                    {isSuspended && (
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => setConfirmingStatusChange(true)}
                        className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-success)] hover:bg-[var(--shop-success-bg)]"
                      >
                        Reactivate store
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
