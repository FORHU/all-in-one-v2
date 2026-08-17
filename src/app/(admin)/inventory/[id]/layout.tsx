import type { Metadata } from "next";

export const metadata: Metadata = { title: "Location Details" };

export default function InventoryLocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
