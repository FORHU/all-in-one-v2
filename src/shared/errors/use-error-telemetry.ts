import { ApiError } from "./api-error";

export function logError(error: unknown) {
  if (!(error instanceof ApiError)) return;

  // send to analytics
  console.log("[ERROR]", {
    category: error.category,
    code: error.code,
    status: error.status,
  });
}
