import type { Metadata } from "next";

export const metadata: Metadata = { title: "Stock Lookup" };

export default function InventoryStockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
