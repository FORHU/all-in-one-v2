import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  getUsers,
  updateUser,
  removeUser,
  type GetUsersParams,
  type UpdateUserInput,
} from "../api/users.client";
import { usersKeys } from "../api/users.keys";

export function useUsers(params: GetUsersParams = {}) {
  return useSafeQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsers(params),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every filter change.
    placeholderData: (prev) => prev,
  });
}

/** PATCH /api/v2/users/:id — role/isActive edit (see the admin Staff table). */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/** DELETE /api/v2/users/:id — soft-delete (see the admin Staff table's "Remove staff"). */
export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (id: string) => removeUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}
