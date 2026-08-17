import type { Metadata } from "next";
import { SectionTabsLayout } from "@/shared/components/SectionTabsLayout";

export const metadata: Metadata = { title: "Product Sync" };

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionTabsLayout sectionHref="/tools">{children}</SectionTabsLayout>;
}
