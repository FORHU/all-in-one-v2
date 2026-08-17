import type { Metadata } from "next";
import { SectionTabsLayout } from "@/shared/components/SectionTabsLayout";

export const metadata: Metadata = { title: "All Products" };

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionTabsLayout sectionHref="/products">{children}</SectionTabsLayout>
  );
}
