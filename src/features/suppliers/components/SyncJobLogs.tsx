"use client";

import { AlertTriangle as AlertTriangleIcon } from "lucide-react";
import { useSyncLogs } from "../hooks/useSyncJobs";
import {
  SYNC_STATUS_STYLES,
  formatSyncLabel,
  formatSyncDateTime,
} from "../lib/presentation";

/** Lazy-loaded log stream for one job's supplier, rendered inside its expanded row. */
export function SyncJobLogs({ jobId }: { jobId: string }) {
  const { data: logs, isLoading, isError } = useSyncLogs(jobId, true);

  if (isLoading) {
    return (
      <div className="space-y-1.5 px-[18px] py-3">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-6 animate-pulse rounded-md bg-[var(--shop-bg-soft)]"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 px-[18px] py-3 text-xs text-[var(--shop-danger)]">
        <AlertTriangleIcon
          className="h-3.5 w-3.5 flex-shrink-0"
          strokeWidth={2.25}
        />
        Couldn&apos;t load logs for this supplier.
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <p className="px-[18px] py-3 text-xs text-[var(--shop-text-muted)]">
        No log entries for this supplier yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--shop-border)] px-[18px]">
      {logs.map((log) => {
        const style = SYNC_STATUS_STYLES[log.status];
        return (
          <li
            key={log.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-xs"
          >
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 font-bold"
              style={{ background: style.bg, color: style.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: style.color }}
              />
              {formatSyncLabel(log.status)}
            </span>
            <span className="font-semibold text-[var(--shop-text)]">
              {formatSyncLabel(log.action)}
            </span>
            <span className="text-[var(--shop-text-muted)]">
              {log.recordsProcessed} records
            </span>
            <span className="text-[var(--shop-text-muted)]">
              {formatSyncDateTime(log.startedAt)}
            </span>
            {log.errorMessage && (
              <span className="w-full text-[var(--shop-danger)]">
                {log.errorMessage}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
