import type { Metadata } from "next";
import { Oswald, Lora } from "next/font/google";
import "./shop-theme.css";

const oswald = Oswald({
  variable: "--font-shop-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const lora = Lora({
  variable: "--font-shop-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { absolute: "All in one" },
  description: "Curated pieces from independent designers.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`shop-theme ${oswald.variable} ${lora.variable}`}>
      {children}
    </div>
  );
}
