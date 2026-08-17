import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
