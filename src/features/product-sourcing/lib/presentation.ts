// Sentinel for "no category chosen yet" — distinct from the explicit "No
// category" choice (value `""`, sent to the backend as `categoryId: null`).
// Lets the import flow require an active choice from the admin instead of
// defaulting silently to uncategorized.
export const UNSELECTED_CATEGORY = "__unselected__";

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
