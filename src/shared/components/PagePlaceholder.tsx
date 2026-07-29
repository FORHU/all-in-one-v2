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
        <h2 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
          {description}
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-[var(--shop-border)] bg-[var(--shop-surface)] px-6 py-16 text-center">
        <p className="text-sm font-medium text-[var(--shop-text-muted)]">
          {title} content coming soon
        </p>
      </div>
    </div>
  );
}
