import { PricingRuleGrid } from "@/features/products/components/PricingRuleGrid";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Pricing
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          Manage markup rules and apply a percentage across your catalog.
        </p>
      </div>
      <PricingRuleGrid />
    </div>
  );
}
