import type { Metadata } from "next";
import { SyncHistoryView } from "@/features/suppliers/components/SyncHistoryView";

export const metadata: Metadata = { title: "Sync History" };

export default function SyncHistoryPage() {
  return <SyncHistoryView />;
}
