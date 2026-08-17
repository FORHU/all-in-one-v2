import type { Metadata } from "next";
import { PagePlaceholder } from "@/shared/components/PagePlaceholder";

export const metadata: Metadata = { title: "Social Accounts" };

export default function SocialAccountsPage() {
  return (
    <PagePlaceholder
      title="Social Accounts"
      description="Connect and manage social media accounts."
    />
  );
}
