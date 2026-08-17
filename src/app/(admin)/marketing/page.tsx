import type { Metadata } from "next";
import { PagePlaceholder } from "@/shared/components/PagePlaceholder";

export const metadata: Metadata = { title: "Campaigns" };

export default function MarketingPage() {
  return (
    <PagePlaceholder
      title="Campaigns"
      description="Create and manage marketing campaigns."
    />
  );
}
