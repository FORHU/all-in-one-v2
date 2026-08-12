"use client";

import { OrdersListView } from "@/features/orders/components/OrdersListView";

export default function ProcessingOrdersPage() {
  return (
    <OrdersListView
      title="Processing"
      description="Orders currently being prepared or shipped."
      status="PROCESSING"
    />
  );
}
