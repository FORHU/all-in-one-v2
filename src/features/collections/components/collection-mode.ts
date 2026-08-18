import type { CollectionType } from "../contracts/collections.contract";

export type CollectionMode = "collection" | "outfit";

// Which `type` values each mode offers — a UI-only grouping over the
// six-value enum, not a schema change. "outfit" means *combination of
// different-role pieces forming one whole*, which is what OUTFIT/LOOKBOOK
// are for this fashion tenant — but the same shape applies to any vertical
// a future tenant sells (a skincare ROUTINE is cleanser+toner+serum in
// different roles; a ROOM_BUNDLE is desk+chair+lamp). All four live in the
// same bucket so a non-fashion tenant isn't stuck with "Collection" as the
// only option; only BUNDLE is genuinely a flat, same-shelf grouping.
export const MODE_TYPES: Record<CollectionMode, CollectionType[]> = {
  collection: ["BUNDLE"],
  outfit: ["OUTFIT", "LOOKBOOK", "ROUTINE", "SETUP", "ROOM_BUNDLE"],
};

export function modeForType(t: CollectionType): CollectionMode {
  return MODE_TYPES.outfit.includes(t) ? "outfit" : "collection";
}
