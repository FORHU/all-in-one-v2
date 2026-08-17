import type { Metadata } from "next";
import { PagePlaceholder } from "@/shared/components/PagePlaceholder";

export const metadata: Metadata = { title: "Connected Accounts" };

export default function ConnectedAccountsPage() {
  return (
    <PagePlaceholder
      title="Connected Accounts"
      description="Manage linked supplier and platform accounts."
    />
  );
}
