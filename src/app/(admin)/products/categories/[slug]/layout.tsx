import type { Metadata } from "next";

export const metadata: Metadata = { title: "Category Details" };

export default function CategoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
