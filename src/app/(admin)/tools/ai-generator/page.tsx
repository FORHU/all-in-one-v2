import type { Metadata } from "next";
import { PagePlaceholder } from "@/shared/components/PagePlaceholder";

export const metadata: Metadata = { title: "AI Generator" };

export default function AiGeneratorPage() {
  return (
    <PagePlaceholder
      title="AI Generator"
      description="Generate product descriptions and marketing copy with AI."
    />
  );
}
