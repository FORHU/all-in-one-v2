import Link from "next/link";
import type { Category } from "../contracts/categories.contract";

export function CategoryCard({ category }: { category: Category }) {
  const childCount = category.children.length;

  return (
    <Link
      href={`/products/categories/${category.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <p className="shop-display mb-1 text-[15px] font-semibold text-[var(--shop-text)]">
        {category.name}
      </p>
      <p className="text-xs text-[var(--shop-text-muted)]">
        {childCount > 0
          ? `${childCount} subcategor${childCount === 1 ? "y" : "ies"}`
          : "No subcategories"}
      </p>
    </Link>
  );
}
