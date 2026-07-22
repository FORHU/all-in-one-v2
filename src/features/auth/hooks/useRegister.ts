"use client";

import { useRouter } from "next/navigation";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { notify } from "@/shared/lib/notify";
import { register } from "../api/auth.client";
import type { RegisterInput } from "../contracts/auth.contract";

export function useRegister() {
  const router = useRouter();

  return useSafeMutation({
    meta: { skipAuthLogout: true },
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: () => {
      notify.success("Account created successfully. Please sign in.");
      router.push("/");
    },
  });
}
