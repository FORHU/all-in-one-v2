import { SectionTabsLayout } from "@/shared/components/SectionTabsLayout";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionTabsLayout sectionHref="/products">{children}</SectionTabsLayout>
  );
}
