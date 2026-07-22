import { SectionTabsLayout } from "@/shared/components/SectionTabsLayout";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionTabsLayout sectionHref="/tools">{children}</SectionTabsLayout>;
}
