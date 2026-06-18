import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { routeError } from "@/shared/errors/error-router";
import { logError } from "@/shared/errors/use-error-telemetry";
import { mapApiValidationToForm } from "@/shared/errors/map-validation";

type UseSafeMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "onError"> & {
  /**
   * Called with mapped field errors when the API returns a VALIDATION (422) error.
   * Use this to bind errors to a form library (e.g., react-hook-form's setError).
   */
  onValidationError?: (fields: Record<string, string[]>) => void;
};

/**
 * Drop-in replacement for useMutation.
 * Automatically:
 * - Routes errors through the FAOS error-router (toast, logout, etc.)
 * - Maps VALIDATION errors to form fields via onValidationError callback
 * - Logs all errors through the telemetry hook
 */
export function useSafeMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(options: UseSafeMutationOptions<TData, TError, TVariables, TContext>) {
  const { onValidationError, ...rest } = options;

  return useMutation({
    ...rest,
    onError: (error, variables, context) => {
      logError(error);

      const fields = mapApiValidationToForm(error);

      if (Object.keys(fields).length > 0 && onValidationError) {
        onValidationError(fields);
        return; // VALIDATION errors are handled by the form — skip global routing
      }

      const result = routeError(error);

      if (result.toast) {
        // Dynamically import to avoid coupling shared/ to toast library at module level
        import("sonner").then(({ toast }) => toast.error(result.toast!));
      }

      if (result.action === "logout" && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    },
  });
}
