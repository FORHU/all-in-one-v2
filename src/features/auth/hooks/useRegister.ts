"use client";

import { useRouter } from "next/navigation";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { notify } from "@/shared/lib/notify";
import { register } from "../api/auth.client";
import type { RegisterInput } from "../contracts/auth.contract";

type UseRegisterOptions = {
  /** Binds VALIDATION (400/409/422) field errors, e.g. to react-hook-form's setError. */
  onValidationError?: (fields: Record<string, string[]>) => void;
};

export function useRegister(options?: UseRegisterOptions) {
  const router = useRouter();

  return useSafeMutation({
    meta: { skipAuthLogout: true },
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: () => {
      notify.success("Account created successfully. Please sign in.");
      router.push("/login");
    },
    onValidationError: options?.onValidationError,
  });
}
