import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cancelled" };

export default function CancelledOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
