import { notFound } from "next/navigation";
import { ProductDetail } from "@/features/storefront/components/ProductDetail";
import {
  featuredProducts,
  getProductById,
} from "@/features/storefront/data/mock-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return featuredProducts.map((product) => ({ id: product.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
