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
    <div className="border-b border-[#e5e7eb] bg-white">
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
                "whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-medium transition",
                isActive
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#6b7280] hover:border-[#d1d5db] hover:text-[#111827]",
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
