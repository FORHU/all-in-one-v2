export function formatPrice(sellPrice: number | undefined): string {
  return sellPrice !== undefined ? `$${sellPrice.toFixed(2)}` : "—";
}

// CJ's product description is raw HTML from an external, untrusted source —
// strip tags for a plain-text preview rather than rendering it verbatim.
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
