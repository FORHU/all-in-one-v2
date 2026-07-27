import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.next-template-v1.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/api/",
        "/products/",
        "/orders/",
        "/customers/",
        "/suppliers/",
        "/reports/",
        "/settings/",
        "/tools/",
        "/marketing/",
        "/activity-logs/",
        "/integrations/",
      ], // Protect private admin routes from crawling
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
