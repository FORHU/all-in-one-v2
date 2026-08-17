import type { Metadata } from "next";
import { SectionTabsLayout } from "@/shared/components/SectionTabsLayout";

export const metadata: Metadata = { title: "All Orders" };

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionTabsLayout sectionHref="/orders">{children}</SectionTabsLayout>
  );
}
