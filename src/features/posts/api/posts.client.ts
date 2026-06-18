import { fetcher } from "@/shared/lib/http";
import {
  PostsResponseSchema,
  type Post,
  type PostsResponse,
  type CreatePostInput,
} from "../contracts/posts.contract";

// ── Mock store (replaces a real database for template demo purposes) ──────────
let MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Getting Started with FAOS Architecture",
    content:
      "FAOS (Feature-Oriented Architecture System) is a scalable pattern for large Next.js apps...",
    author: "Alice Chen",
    createdAt: "2026-01-15T10:00:00.000Z",
    published: true,
  },
  {
    id: "2",
    title: "Why Zod Contracts Beat TypeScript-Only Types",
    content:
      "TypeScript types are erased at runtime. Zod schemas validate your data at the boundary...",
    author: "Bob Martinez",
    createdAt: "2026-02-20T14:30:00.000Z",
    published: true,
  },
  {
    id: "3",
    title: "TanStack Query v5: The Complete Guide",
    content:
      "React Query v5 brings major improvements to the mutation API and type inference...",
    author: "Alice Chen",
    createdAt: "2026-03-05T09:00:00.000Z",
    published: false,
  },
];

/**
 * Get all posts.
 * TODO: Replace mock with real API: const raw = await fetcher<unknown>("/api/posts");
 */
export const getPosts = async (): Promise<PostsResponse> => {
  return PostsResponseSchema.parse(MOCK_POSTS);
};

/**
 * Create a new post.
 * Demonstrates useSafeMutation — validation errors are mapped to form fields.
 */
export const createPost = async (input: CreatePostInput): Promise<Post> => {
  // TODO: Replace with: const raw = await fetcher<unknown>("/api/posts", { method: "POST", body: JSON.stringify(input) });
  const newPost: Post = {
    id: String(Date.now()),
    title: input.title,
    content: input.content,
    author: "You",
    createdAt: new Date().toISOString(),
    published: input.published ?? false,
  };
  MOCK_POSTS = [newPost, ...MOCK_POSTS];
  return newPost;
};

/**
 * Delete a post by ID.
 * Demonstrates useSafeMutation with invalidation.
 */
export const deletePost = async (id: string): Promise<void> => {
  // TODO: Replace with: await fetcher<void>(`/api/posts/${id}`, { method: "DELETE" });
  MOCK_POSTS = MOCK_POSTS.filter((p) => p.id !== id);
};
