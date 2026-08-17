import type { Metadata } from "next";
import { PagePlaceholder } from "@/shared/components/PagePlaceholder";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <PagePlaceholder
      title="Integrations"
      description="Connect third-party services and APIs."
    />
  );
}
