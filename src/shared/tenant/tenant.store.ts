import { create } from "zustand";
import {
  getTenantSlug,
  setTenantSlug,
  clearTenantSlug,
} from "./tenant-storage";

type TenantState = {
  tenantSlug: string | null;
  setTenantSlug: (slug: string) => void;
  clearTenantSlug: () => void;
};

export const useTenantStore = create<TenantState>((set) => ({
  tenantSlug: getTenantSlug(),
  setTenantSlug: (slug) => {
    // An empty slug means "Platform" (all stores) — store that as cleared
    // rather than persisting an empty string.
    if (!slug) {
      clearTenantSlug();
      set({ tenantSlug: null });
      return;
    }
    setTenantSlug(slug);
    set({ tenantSlug: slug });
  },
  clearTenantSlug: () => {
    clearTenantSlug();
    set({ tenantSlug: null });
  },
}));
