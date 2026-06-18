import { z } from "zod";

/**
 * FAOS v5 — Posts Contracts
 *
 * Authoritative shape for all posts API responses.
 * Types are derived from schemas — never declared separately.
 */

export const PostSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  author: z.string(),
  createdAt: z.string().datetime(),
  published: z.boolean().default(false),
});

export const PostsResponseSchema = z.array(PostSchema);

export const CreatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().optional().default(false),
});

export type Post = z.infer<typeof PostSchema>;
export type PostsResponse = z.infer<typeof PostsResponseSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
