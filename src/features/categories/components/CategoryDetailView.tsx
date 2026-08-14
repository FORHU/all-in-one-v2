"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Pencil as PencilIcon,
  Plus as PlusIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
} from "lucide-react";
import { useCategory } from "../hooks/useCategory";
import { CategoryCard } from "./CategoryCard";
import { CategoryGridSkeleton } from "./CategoryGridSkeleton";
import { CategoryFormModal } from "./CategoryFormModal";
import type { Category } from "../contracts/categories.contract";

export function CategoryDetailView({ slug }: { slug: string }) {
  // Same tenantSlug/localStorage hydration hazard as CategoryGrid.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: category, isLoading, error, refetch } = useCategory(slug);
  const [editing, setEditing] = useState<Category | null>(null);
  const [addingSubcategory, setAddingSubcategory] = useState(false);

  if (!mounted || isLoading) {
    return <CategoryGridSkeleton />;
  }

  // Same rationale as CategoryGrid: distinguish a real fetch failure from a
  // genuine 404, which `!category` alone can't tell apart.
  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-danger)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-danger)]">
          Failed to load this category.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-xs font-semibold text-[var(--shop-accent)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
        <p className="text-sm text-[var(--shop-text-muted)]">
          Category not found.
        </p>
        <Link
          href="/products/categories"
          className="mt-3 inline-block text-xs font-medium text-[var(--shop-accent)]"
        >
          Back to categories
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={
          category.parent
            ? `/products/categories/${category.parent.slug}`
            : "/products/categories"
        }
        className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)] transition hover:bg-[var(--shop-bg)] hover:text-[var(--shop-text)]"
      >
        <ArrowLeftIcon className="h-3 w-3" strokeWidth={2.5} />
        {category.parent ? category.parent.name : "All categories"}
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
            {category.name}
          </h2>
          <p className="mb-3 mt-1 text-sm text-[var(--shop-text-muted)]">
            {category.productCount} product
            {category.productCount === 1 ? "" : "s"} in this category
          </p>
          <Link
            href={`/products?categoryId=${category.id}`}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
            style={{ backgroundColor: "var(--shop-accent-dark)" }}
          >
            View products
            <ArrowRightIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setEditing(category)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-wide text-[var(--shop-text)] transition hover:bg-[var(--shop-bg)]"
        >
          <PencilIcon className="h-3 w-3" strokeWidth={2.5} />
          Edit
        </button>
      </div>

      <div className="mb-3.5 flex items-center justify-between">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
          Subcategories
        </p>
        <button
          type="button"
          onClick={() => setAddingSubcategory(true)}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:brightness-90"
          style={{ backgroundColor: "var(--shop-accent-dark)" }}
        >
          <PlusIcon className="h-3 w-3" strokeWidth={2.5} />
          Add subcategory
        </button>
      </div>

      {category.children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] p-10 text-center">
          <p className="text-sm text-[var(--shop-text-muted)]">
            No subcategories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.children.map((c) => (
            <CategoryCard key={c.id} category={c} onEdit={setEditing} />
          ))}
        </div>
      )}

      {editing && (
        <CategoryFormModal
          category={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {addingSubcategory && (
        <CategoryFormModal
          defaultParentId={category.id}
          onClose={() => setAddingSubcategory(false)}
        />
      )}
    </div>
  );
}
