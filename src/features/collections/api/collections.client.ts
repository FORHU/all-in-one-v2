import { fetcher } from "@/shared/lib/http";
import {
  CollectionsResponseSchema,
  type Collection,
} from "../contracts/collections.contract";

/** GET /api/v2/collections — requires x-tenant-slug, attached by http.ts. */
export async function getCollections(): Promise<Collection[]> {
  const raw = await fetcher<unknown>("/api/v2/collections");
  return CollectionsResponseSchema.parse(raw).data;
}
