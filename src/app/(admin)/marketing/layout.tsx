import { SectionTabsLayout } from "@/shared/components/SectionTabsLayout";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionTabsLayout sectionHref="/marketing">{children}</SectionTabsLayout>
  );
}
