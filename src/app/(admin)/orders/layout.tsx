import { SectionTabsLayout } from "@/shared/components/SectionTabsLayout";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionTabsLayout sectionHref="/orders">{children}</SectionTabsLayout>
  );
}
