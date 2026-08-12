"use client";

import { OrdersListView } from "@/features/orders/components/OrdersListView";

export default function OrdersPage() {
  return (
    <OrdersListView
      title="Orders"
      description="View and manage all customer orders for this store."
    />
  );
}
