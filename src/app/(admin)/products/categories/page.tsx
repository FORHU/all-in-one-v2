import type { Metadata } from "next";
import { CategoryGrid } from "@/features/categories/components/CategoryGrid";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <CategoryGrid
        heading={{
          title: "Categories",
          subtitle: "Organize products into categories.",
        }}
      />
    </div>
  );
}
