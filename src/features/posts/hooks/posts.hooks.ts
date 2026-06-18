import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useQueryClient } from "@tanstack/react-query";
import { getPosts, createPost, deletePost } from "../api/posts.client";
import { postsKeys } from "../api/posts.keys";
import type { CreatePostInput } from "../contracts/posts.contract";

/** Fetch all posts. */
export function usePosts() {
  return useSafeQuery({
    queryKey: postsKeys.lists(),
    queryFn: getPosts,
  });
}

/** Create a new post. Invalidates the posts list on success. */
export function useCreatePost(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
}) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onValidationError: options?.onValidationError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}

/** Delete a post by ID. Invalidates the posts list on success. */
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}
