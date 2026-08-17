import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { useTenantStore } from "@/shared/tenant/tenant.store";
import { notify } from "@/shared/lib/notify";
import {
  getReturns,
  getReturnsByOrder,
  approveReturn,
  rejectReturn,
  issueReturnRefund,
  createReturn,
  type GetReturnsParams,
  type RejectReturnInput,
  type IssueRefundInput,
  type CreateReturnInput,
} from "../api/returns.client";
import { returnsKeys } from "../api/returns.keys";

export function useReturns(params: GetReturnsParams = {}) {
  const tenantSlug = useTenantStore((s) => s.tenantSlug);

  return useSafeQuery({
    queryKey: returnsKeys.list(tenantSlug, params),
    queryFn: () => getReturns(params),
    enabled: Boolean(tenantSlug),
    // Keep showing the previous page's rows while the next page loads,
    // instead of flashing back to the loading skeleton on every filter change.
    placeholderData: (prev) => prev,
  });
}

/** Every return filed against one order — powers the Returns section on order detail. */
export function useReturnsByOrder(orderId: string) {
  return useSafeQuery({
    queryKey: returnsKeys.byOrder(orderId),
    queryFn: () => getReturnsByOrder(orderId),
    enabled: Boolean(orderId),
  });
}

// A mutation on any one return can affect both the queue view (returnsKeys.lists())
// and any order's embedded panel (returnsKeys.byOrder(orderId)) — since ReturnActions
// is used from both places without knowing which. Invalidating the shared `all` root
// covers every descendant key without each hook needing to track which order it's for.
function invalidateReturns(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: returnsKeys.all });
}

/** PENDING -> APPROVED. */
export function useApproveReturn() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (returnId: string) => approveReturn(returnId),
    onSuccess: () => {
      invalidateReturns(queryClient);
      notify.success("Return approved.");
    },
  });
}

/** PENDING -> REJECTED. */
export function useRejectReturn() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({
      returnId,
      ...input
    }: RejectReturnInput & { returnId: string }) =>
      rejectReturn(returnId, input),
    onSuccess: () => {
      invalidateReturns(queryClient);
      notify.success("Return rejected.");
    },
  });
}

/** APPROVED only — issues a real Stripe refund via PaymentService.refundPayment. */
export function useIssueReturnRefund() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({
      returnId,
      orderId,
      ...input
    }: IssueRefundInput & { returnId: string; orderId: string }) =>
      issueReturnRefund(returnId, orderId, input),
    onSuccess: () => {
      invalidateReturns(queryClient);
      notify.success("Refund issued.");
    },
  });
}

/** Opens a new return request for an order — the entry point into the refund flow. */
export function useCreateReturn() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (input: CreateReturnInput) => createReturn(input),
    onSuccess: () => {
      invalidateReturns(queryClient);
      notify.success("Return request created.");
    },
  });
}
