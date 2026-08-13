import Link from "next/link";
import { Pencil as PencilIcon } from "lucide-react";
import type { Category } from "../contracts/categories.contract";

type CategoryCardProps = {
  category: Category;
  onEdit: (category: Category) => void;
};

export function CategoryCard({ category, onEdit }: CategoryCardProps) {
  const childCount = category.children.length;

  return (
    <div className="group relative">
      <Link
        href={`/products/categories/${category.slug}`}
        className="block overflow-hidden rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <p className="shop-display mb-1 pr-8 text-[15px] font-semibold text-[var(--shop-text)]">
          {category.name}
        </p>
        <p className="text-xs text-[var(--shop-text-muted)]">
          {childCount > 0
            ? `${childCount} subcategor${childCount === 1 ? "y" : "ies"}`
            : "No subcategories"}
        </p>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(category);
        }}
        aria-label={`Edit ${category.name}`}
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)]/90 text-[var(--shop-text-muted)] opacity-0 shadow-sm backdrop-blur transition hover:text-[var(--shop-accent)] focus-visible:opacity-100 group-hover:opacity-100"
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
