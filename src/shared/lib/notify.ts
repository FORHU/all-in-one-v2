import { toast } from "sonner";

/**
 * Uniform top-right notifications (Sonner Toaster in app/layout.tsx).
 * Use this instead of importing `toast` directly in features.
 */
type NotifyOptions = { id?: string };

export const notify = {
  success(message: string, options?: NotifyOptions) {
    toast.success(message, options);
  },
  error(message: string, options?: NotifyOptions) {
    toast.error(message, options);
  },
  info(message: string, options?: NotifyOptions) {
    toast.info(message, options);
  },
};
