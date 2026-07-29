"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavChildItem } from "@/shared/navigation/nav-items";

type SectionSubTabsProps = {
  items: NavChildItem[];
};

export function SectionSubTabs({ items }: SectionSubTabsProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-[var(--shop-border)] bg-[var(--shop-surface)]">
      <nav
        className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 lg:px-6"
        aria-label="Section tabs"
      >
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-semibold uppercase tracking-wide transition",
                isActive
                  ? "border-[var(--shop-accent)] text-[var(--shop-text)]"
                  : "border-transparent text-[var(--shop-text-muted)] hover:border-[var(--shop-border)] hover:text-[var(--shop-text)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
