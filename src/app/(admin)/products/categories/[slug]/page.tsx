"use client";

import { use } from "react";
import { CategoryDetailView } from "@/features/categories/components/CategoryDetailView";

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <CategoryDetailView slug={slug} />
    </div>
  );
}
