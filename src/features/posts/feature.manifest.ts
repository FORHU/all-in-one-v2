/**
 * FAOS v5 — Feature Manifest
 *
 * CI-ONLY: This file is never imported into the React tree.
 * It is a static declaration consumed by tools/validate-architecture.ts.
 */
export const featureManifest = {
  name: "posts",
  dependsOn: ["auth"] as const,
  exposes: [
    "PostList",
    "CreatePostForm",
    "usePosts",
    "useCreatePost",
    "useDeletePost",
  ] as const,
} as const;

export type PostsManifest = typeof featureManifest;
