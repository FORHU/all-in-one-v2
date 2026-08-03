import { ApiError } from "./api-error";

export function routeError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return {
      toast: "Unexpected error occurred",
      action: "log",
    };
  }

  switch (error.category) {
    case "AUTH":
      return {
        toast: error.message || "Session expired",
        action: "logout",
      };

    case "FORBIDDEN":
      return {
        toast: "Access denied",
        action: "none",
      };

    case "VALIDATION": {
      // Only suppress the toast when there's an actual field-level message to
      // show instead — otherwise a VALIDATION error with no `details` (e.g. a
      // plain "Invalid credentials" 400 on login) would fail completely
      // silently: no toast here, and no field message either since nothing
      // triggers onValidationError without details to map.
      const hasFieldDetails =
        error.details && Object.keys(error.details).length > 0;

      return hasFieldDetails
        ? { toast: null, action: "form" }
        : { toast: error.message, action: "log" };
    }

    case "NETWORK":
      return {
        toast: "Network connection issue",
        action: "retryable",
      };

    default:
      return {
        toast: error.message,
        action: "log",
      };
  }
}
