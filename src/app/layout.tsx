import type { Metadata } from "next";
import { Oswald, Manrope } from "next/font/google";
import "./globals.css";
import "./theme.css";
import QueryProvider from "@/shared/lib/providers/query-provider";
import { Toaster } from "sonner";
import { AuthListener } from "@/features/auth/components/AuthListener";

const oswald = Oswald({
  variable: "--font-shop-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-shop-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Boilerplate 2026",
    default: "Admin Central | Sign in",
  },
  description: "Secure E-commerce Management Suite — sign in to Admin Central.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://boilerplate-2026.vercel.app",
  ),
  openGraph: {
    title: "Boilerplate 2026 | Premium Starter",
    description:
      "Experience the next generation of development with Boilerplate 2026.",
    url: "https://boilerplate-2026.vercel.app",
    siteName: "Boilerplate 2026",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boilerplate 2026 | Premium Starter",
    description:
      "Experience the next generation of development with Boilerplate 2026.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`shop-theme ${oswald.variable} ${manrope.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster position="top-right" theme="system" richColors />
          <AuthListener />
        </QueryProvider>
      </body>
    </html>
  );
}
