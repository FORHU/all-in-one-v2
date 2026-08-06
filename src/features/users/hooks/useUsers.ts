import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getUsers, type GetUsersParams } from "../api/users.client";
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
