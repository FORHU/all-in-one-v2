import { z } from "zod";

/**
 * FAOS v5 — Zod Contract
 *
 * api-guide.md publishes no sample JSON for this endpoint, and the first
 * real response (captured via DevTools) contradicted the guide's own prose
 * ("active collections... e.g. Summer Sale, Best Sellers" implied a flat
 * list): collections are actually a self-referencing tree exactly like
 * categories (`parentId` / `children`, seen nesting an "OUTFIT" under a
 * "LOOKBOOK"). Field is `title`, not `name`. There's no `isActive` —
 * visibility is `isPublic` + `isDeleted` instead. `type` distinguishes tree
 * levels seen so far but isn't documented as a closed enum, so it's kept a
 * plain string rather than guessed at as a z.enum. `imageFileId`,
 * `metadata`, and `items` are deliberately not declared — unread by
 * anything here, so Zod strips them at parse time same as the password
 * hash in users.contract.ts.
 */
export type Collection = {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  sortOrder: number;
  imageUrl: string | null;
  isPublic: boolean;
  isDeleted: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: Collection[];
};

export const CollectionSchema: z.ZodType<Collection> = z.lazy(() =>
  z.object({
    id: z.string(),
    tenantId: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    type: z.string(),
    sortOrder: z.number(),
    imageUrl: z.string().nullable(),
    isPublic: z.boolean(),
    isDeleted: z.boolean(),
    parentId: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    children: z.array(CollectionSchema).default([]),
  }),
);

/** GET /api/v2/collections — requires x-tenant-slug, attached by http.ts. */
export const CollectionsResponseSchema = z.object({
  status: z.string(),
  statusCode: z.number(),
  data: z.array(CollectionSchema),
});
