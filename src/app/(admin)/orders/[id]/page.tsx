"use client";

import { use } from "react";
import { OrderDetailView } from "@/features/orders/components/OrderDetailView";
import { useRefreshOrder } from "@/features/orders/hooks/useOrderDetail";
import { OrderReturnsPanel } from "@/features/returns/components/OrderReturnsPanel";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // A refund issued from the Returns panel (a separate feature) can flip
  // this order to REFUNDED — this is how that panel asks the order detail
  // query to refresh without either feature importing the other.
  const refreshOrder = useRefreshOrder(id);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-6">
      <OrderDetailView orderId={id} />
      <OrderReturnsPanel orderId={id} onChanged={refreshOrder} />
    </div>
  );
}
