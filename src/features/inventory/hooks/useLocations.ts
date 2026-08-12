import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  type CreateLocationInput,
  type UpdateLocationInput,
  type GetLocationsParams,
} from "../api/inventory.client";
import { inventoryKeys } from "../api/inventory.keys";

/** Paginated inventory locations for the current store. */
export function useLocations(params: GetLocationsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: inventoryKeys.locationsList(tenantSlug, params),
    queryFn: () => getLocations(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every page change.
    placeholderData: (prev) => prev,
  });
}

/** Single location, including every stock row currently held there. */
export function useLocation(id: string) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: inventoryKeys.locationDetail(tenantSlug, id),
    queryFn: () => getLocation(id),
    enabled: Boolean(tenantSlug) && Boolean(id),
  });
}

export function useCreateLocation(options?: {
  onValidationError?: (fields: Record<string, string[]>) => void;
}) {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: (input: CreateLocationInput) => createLocation(input),
    onValidationError: options?.onValidationError,
    onSuccess: (location) => {
      // Prefix-invalidate every cached page/search combo, not just the one
      // this component happens to be viewing.
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.locations(),
      });
      notify.success(`Location "${location.name}" created.`);
    },
  });
}

export function useUpdateLocation(id: string) {
  const queryClient = useQueryClient();
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeMutation({
    mutationFn: (input: UpdateLocationInput) => updateLocation(id, input),
    onSuccess: (location) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.locationDetail(tenantSlug, id),
      });
      // Prefix-invalidate every cached page/search combo, not just the one
      // this component happens to be viewing.
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.locations(),
      });
      notify.success(`Location "${location.name}" updated.`);
    },
  });
}
