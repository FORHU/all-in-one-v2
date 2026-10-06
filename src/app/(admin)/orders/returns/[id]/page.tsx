"use client";

import { use } from "react";
import { ReturnDetailView } from "@/features/returns/components/ReturnDetailView";

export default function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-6">
      <ReturnDetailView returnId={id} />
    </div>
  );
}
