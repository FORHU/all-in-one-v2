"use client";

import { use } from "react";
import { OrderDetailView } from "@/features/orders/components/OrderDetailView";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <OrderDetailView orderId={id} />
    </div>
  );
}
