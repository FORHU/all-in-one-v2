import type { Metadata } from "next";
import { PricingRuleGrid } from "@/features/products/components/PricingRuleGrid";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <PricingRuleGrid heading={{ title: "Pricing" }} />
    </div>
  );
}
