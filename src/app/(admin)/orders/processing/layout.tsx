import type { Metadata } from "next";

export const metadata: Metadata = { title: "Processing" };

export default function ProcessingOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
