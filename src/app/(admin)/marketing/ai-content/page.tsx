import type { Metadata } from "next";
import { PagePlaceholder } from "@/shared/components/PagePlaceholder";

export const metadata: Metadata = { title: "AI Content" };

export default function AiContentPage() {
  return (
    <PagePlaceholder
      title="AI Content"
      description="Generate and review AI-powered marketing content."
    />
  );
}
