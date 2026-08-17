import type { Metadata } from "next";
import { PagePlaceholder } from "@/shared/components/PagePlaceholder";

export const metadata: Metadata = { title: "Activity Logs" };

export default function ActivityLogsPage() {
  return (
    <PagePlaceholder
      title="Activity Logs"
      description="Audit trail of recent admin actions."
    />
  );
}
