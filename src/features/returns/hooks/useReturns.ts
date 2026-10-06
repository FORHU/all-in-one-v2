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
  getReturnDetail,
  startReturnReview,
  requestReturnEvidence,
  approveReturnRequest,
  rejectReturnRequest,
  fileCjDispute,
  refreshCjDispute,
  confirmCjDisputeOutcome,
  processRefund,
  type GetReturnsParams,
  type RejectReturnInput,
  type IssueRefundInput,
  type CreateReturnInput,
  type ProcessRefundInput,
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

/** Full admin review detail for one request — backs ReturnDetailView.tsx. */
export function useReturnDetail(id: string) {
  return useSafeQuery({
    queryKey: returnsKeys.detail(id),
    queryFn: () => getReturnDetail(id),
    enabled: Boolean(id),
  });
}

// Detail-page mutations invalidate both the detail query for this one return
// and the shared `all` root (queue list + any order's embedded panel) —
// same reasoning as invalidateReturns above, just also covering the one key
// that's specific to a single return's own page.
function invalidateReturnDetail(queryClient: QueryClient, id: string) {
  queryClient.invalidateQueries({ queryKey: returnsKeys.detail(id) });
  invalidateReturns(queryClient);
}

/** PENDING -> UNDER_REVIEW. New request lifecycle — see return-status.util.ts. */
export function useStartReturnReview() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (id: string) => startReturnReview(id),
    onSuccess: (_data, id) => {
      invalidateReturnDetail(queryClient, id);
      notify.success("Marked as under review.");
    },
  });
}

/** UNDER_REVIEW -> EVIDENCE_REQUIRED. */
export function useRequestReturnEvidence() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      requestReturnEvidence(id, note),
    onSuccess: (_data, { id }) => {
      invalidateReturnDetail(queryClient, id);
      notify.success("Evidence requested from customer.");
    },
  });
}

/** UNDER_REVIEW -> APPROVED. New request lifecycle — distinct from the legacy useApproveReturn above. */
export function useApproveReturnRequest() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      approveReturnRequest(id, note),
    onSuccess: (_data, { id }) => {
      invalidateReturnDetail(queryClient, id);
      notify.success("Request approved.");
    },
  });
}

/** UNDER_REVIEW or EVIDENCE_REQUIRED -> REJECTED. New request lifecycle. */
export function useRejectReturnRequest() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectReturnRequest(id, reason),
    onSuccess: (_data, { id }) => {
      invalidateReturnDetail(queryClient, id);
      notify.success("Request rejected.");
    },
  });
}

/** APPROVED -> CJ_DISPUTE_SUBMITTED (or stays APPROVED with a FAILED_TO_SUBMIT dispute row — see ReturnService.fileCjDispute). */
export function useFileCjDispute() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (id: string) => fileCjDispute(id),
    onSuccess: (data, id) => {
      invalidateReturnDetail(queryClient, id);
      notify[data.filed ? "success" : "error"](
        data.filed
          ? "Dispute filed with supplier."
          : `Could not file with supplier: ${data.reason}`,
      );
    },
  });
}

/** On-demand pull of CJ's current ruling — never changes the request's status itself. */
export function useRefreshCjDispute() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (id: string) => refreshCjDispute(id),
    onSuccess: (_data, id) => {
      // Dispute's own raw fields live inside the detail query's nested
      // `disputes` array — refetch it so the panel shows the fresh pull.
      queryClient.invalidateQueries({ queryKey: returnsKeys.detail(id) });
    },
  });
}

/** The explicit admin decision CJ's unverified live API requires — see ReturnService.confirmCjOutcome. */
export function useConfirmCjDisputeOutcome() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({
      id,
      outcome,
      note,
    }: {
      id: string;
      outcome: "APPROVED" | "REJECTED";
      note?: string;
    }) => confirmCjDisputeOutcome(id, outcome, note),
    onSuccess: (_data, { id }) => {
      invalidateReturnDetail(queryClient, id);
      notify.success("Outcome recorded.");
    },
  });
}

/**
 * APPROVED/CJ_APPROVED/CJ_REJECTED/RETURN_PROCESSING -> REFUND_PROCESSING.
 * The real Stripe refund — distinct from the legacy useIssueReturnRefund
 * above, which only ever worked from plain APPROVED.
 */
export function useProcessRefund() {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: ({ id, ...input }: ProcessRefundInput & { id: string }) =>
      processRefund(id, input),
    onSuccess: (_data, { id }) => {
      invalidateReturnDetail(queryClient, id);
      notify.success("Refund is processing.");
    },
  });
}
