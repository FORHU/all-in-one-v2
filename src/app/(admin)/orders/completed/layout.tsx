import type { Metadata } from "next";

export const metadata: Metadata = { title: "Completed" };

export default function CompletedOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
