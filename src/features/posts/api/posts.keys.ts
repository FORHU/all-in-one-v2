export const postsKeys = {
  all: ["posts"] as const,
  lists: () => [...postsKeys.all, "list"] as const,
  detail: (id: string) => [...postsKeys.all, "detail", id] as const,
} as const;
