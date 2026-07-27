export function StarRating({ rating }: { rating: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.min(1, Math.max(0, rating - i));
    return fill;
  });

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {stars.map((fill, i) => (
        <span
          key={i}
          className="relative inline-block h-3.5 w-3.5 text-[var(--shop-border)]"
        >
          <span className="absolute inset-0">★</span>
          <span
            className="absolute inset-0 overflow-hidden text-[var(--shop-accent)]"
            style={{ width: `${fill * 100}%` }}
          >
            ★
          </span>
        </span>
      ))}
    </div>
  );
}
