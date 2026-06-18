import { fetcher } from "@/shared/lib/http";
import { UsersResponseSchema } from "../contracts/users.contract";

export const getUsers = async () => {
  const raw = await fetcher<unknown>("/api/users");
  return UsersResponseSchema.parse(raw); // throws ZodError if backend drifts
};
