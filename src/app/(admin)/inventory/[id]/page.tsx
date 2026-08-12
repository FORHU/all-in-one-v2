"use client";

import { use } from "react";
import { LocationDetailView } from "@/features/inventory/components/LocationDetailView";

export default function InventoryLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <LocationDetailView id={id} />;
}
