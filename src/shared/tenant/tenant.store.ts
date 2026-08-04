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
    setTenantSlug(slug);
    set({ tenantSlug: slug });
  },
  clearTenantSlug: () => {
    clearTenantSlug();
    set({ tenantSlug: null });
  },
}));
