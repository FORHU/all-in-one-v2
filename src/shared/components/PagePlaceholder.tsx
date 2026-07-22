type PagePlaceholderProps = {
  title: string;
  description?: string;
};

export function PagePlaceholder({
  title,
  description = "This section is ready for UI — no backend wired yet.",
}: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
      </div>
      <div className="rounded-lg border border-dashed border-[#d1d5db] bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-[#9ca3af]">
          {title} content coming soon
        </p>
      </div>
    </div>
  );
}
