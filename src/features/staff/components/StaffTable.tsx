"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { notify } from "@/shared/lib/notify";
import { STAFF_MEMBERS } from "../data/mock-staff";
import { StaffStatsBar } from "./StaffStatsBar";
import { StaffFilterBar } from "./StaffFilterBar";
import {
  ROLE_STYLES,
  STATUS_STYLES,
  avatarColorForRole,
  initials,
} from "../lib/presentation";

export function StaffTable() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return STAFF_MEMBERS.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [search, roleFilter]);

  const notAvailable = (message: string) => {
    notify.info(message);
    setOpenMenu(null);
  };

  return (
    <div>
      <StaffStatsBar />
      <StaffFilterBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)]">
        <div className="grid grid-cols-[2fr_2fr_1.1fr_1fr_1fr_1.2fr] items-center gap-3 border-b border-[var(--shop-border)] bg-[var(--shop-bg-soft)] px-[18px] py-3 text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          <span>Staff</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last Active</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <p className="px-[18px] py-8 text-center text-sm text-[var(--shop-text-muted)]">
            No staff match your search.
          </p>
        ) : (
          filtered.map((m) => {
            const roleStyle = ROLE_STYLES[m.role];
            const statusStyle =
              STATUS_STYLES[m.status.toLowerCase()] ?? STATUS_STYLES.active;

            return (
              <div
                key={m.id}
                className="grid grid-cols-[2fr_2fr_1.1fr_1fr_1fr_1.2fr] items-center gap-3 border-b border-[var(--shop-border)] px-[18px] py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white"
                    style={{ background: avatarColorForRole(m.role) }}
                  >
                    {initials(m.name)}
                  </div>
                  <p className="truncate text-sm font-semibold text-[var(--shop-text)]">
                    {m.name}
                  </p>
                </div>
                <span className="truncate text-xs text-[var(--shop-text-muted)]">
                  {m.email}
                </span>
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: roleStyle.bg, color: roleStyle.color }}
                >
                  {m.role}
                </span>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: statusStyle.color }}
                  />
                  {m.status}
                </span>
                <span className="text-xs text-[var(--shop-text-muted)]">
                  {m.lastActive}
                </span>
                {m.isYou ? (
                  <span className="justify-self-end text-xs font-semibold text-[var(--shop-text-muted)]">
                    You
                  </span>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        notAvailable("Editing roles isn't wired up yet.")
                      }
                      className="text-xs font-semibold text-[var(--shop-accent)] hover:underline"
                    >
                      Edit role
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(openMenu === m.id ? null : m.id)
                        }
                        aria-label={`Actions for ${m.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === m.id && (
                        <div className="absolute right-0 top-8 z-10 w-[160px] rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1.5 shadow-lg">
                          <button
                            type="button"
                            onClick={() =>
                              notAvailable(
                                "Resending invites isn't wired up yet.",
                              )
                            }
                            className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
                          >
                            Resend invite
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              notAvailable("Removing staff isn't wired up yet.")
                            }
                            className="block w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)]"
                          >
                            Remove staff
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
