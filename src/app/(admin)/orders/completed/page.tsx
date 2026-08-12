"use client";

import { OrdersListView } from "@/features/orders/components/OrdersListView";

export default function CompletedOrdersPage() {
  return (
    <OrdersListView
      title="Completed"
      description="Orders that have been fulfilled and delivered."
      status="FULFILLED"
    />
  );
}
