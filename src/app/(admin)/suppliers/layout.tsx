import { SectionTabsLayout } from "@/shared/components/SectionTabsLayout";

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionTabsLayout sectionHref="/suppliers">{children}</SectionTabsLayout>
  );
}
