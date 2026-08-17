import type { Metadata } from "next";
import { PagePlaceholder } from "@/shared/components/PagePlaceholder";

export const metadata: Metadata = { title: "Bulk Update" };

export default function BulkUpdatePage() {
  return (
    <PagePlaceholder
      title="Bulk Update"
      description="Update multiple products or records at once."
    />
  );
}
