import { toast } from "sonner";

/**
 * Uniform top-right notifications (Sonner Toaster in app/layout.tsx).
 * Use this instead of importing `toast` directly in features.
 */
export const notify = {
  success(message: string) {
    toast.success(message);
  },
  error(message: string) {
    toast.error(message);
  },
  info(message: string) {
    toast.info(message);
  },
};
