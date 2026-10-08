"use client";

import { OrdersListView } from "@/features/orders/components/OrdersListView";

export default function CancelledOrdersPage() {
  return (
    <OrdersListView
      title="Cancelled"
      description="Orders cancelled by a customer or an admin before fulfillment."
      status="CANCELLED"
    />
  );
}
