"use client";

import { useState } from "react";
import { CollectionGrid } from "@/features/collections/components/CollectionGrid";
import { ProductFormModal } from "@/features/products/components/ProductFormModal";
import { useProduct } from "@/features/products/hooks/useProducts";
import type { AdminProduct } from "@/features/products/contracts/products.contract";

export default function CollectionsPage() {
  // Collections and products can't import each other (FAOS cross-feature
  // boundary) — this app-layer page is the bridge: it owns opening
  // ProductFormModal for a product clicked inside CollectionFormModal, and
  // feeds the saved result back down so that row's title/thumbnail update
  // immediately instead of staying stale until the collection modal reopens.
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [updatedProduct, setUpdatedProduct] = useState<{
    id: string;
    title: string;
    thumbnailUrl: string | null;
  } | null>(null);

  const { data: editingProduct, isLoading: isLoadingEditingProduct } =
    useProduct(editingProductId);

  const handleSaved = (product: AdminProduct) => {
    setUpdatedProduct({
      id: product.id,
      title: product.title,
      thumbnailUrl: product.thumbnailUrl ?? null,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <CollectionGrid
        heading={{
          title: "Collections",
          subtitle: "Group products into curated collections.",
        }}
        onEditProduct={setEditingProductId}
        updatedProduct={updatedProduct}
      />

      {editingProductId && !isLoadingEditingProduct && editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onSaved={handleSaved}
          onClose={() => setEditingProductId(null)}
        />
      )}
    </div>
  );
}
