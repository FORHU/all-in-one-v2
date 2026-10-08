"use client";

import { useState } from "react";
import { Image as ImageIcon, Film as FilmIcon } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { ReturnEvidence } from "../contracts/returns.contract";

/**
 * Thumbnail grid of a request's customer/admin-uploaded evidence, built on
 * the shared Modal shell for the enlarged view — no lightbox/gallery
 * component existed anywhere in this app before this (confirmed: the
 * product quick-view's "Photos (N)" grid is static thumbnails with no
 * enlarge behavior). Images open full-size in the Modal; videos get a
 * native <video> player since evidence can be either.
 */
export function EvidenceGallery({ evidence }: { evidence: ReturnEvidence[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (evidence.length === 0) {
    return (
      <p className="text-sm text-[var(--shop-text-muted)]">
        No evidence uploaded.
      </p>
    );
  }

  const active = activeIndex !== null ? evidence[activeIndex] : null;
  const isVideo = (item: ReturnEvidence) => item.mimeType?.startsWith("video/");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {evidence.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--shop-border)]"
          >
            {isVideo(item) ? (
              <div className="flex h-full w-full items-center justify-center bg-[var(--shop-bg-soft)]">
                <FilmIcon className="h-5 w-5 text-[var(--shop-text-muted)]" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- evidence thumbnail, not a next/image-managed asset
              <img
                src={item.url}
                alt="Evidence"
                className="h-full w-full object-cover transition group-hover:brightness-90"
              />
            )}
            <span className="absolute bottom-1 right-1 rounded-full bg-black/60 p-1">
              {isVideo(item) ? (
                <FilmIcon className="h-2.5 w-2.5 text-white" />
              ) : (
                <ImageIcon className="h-2.5 w-2.5 text-white" />
              )}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <Modal
          onClose={() => setActiveIndex(null)}
          title={`Evidence ${activeIndex! + 1} of ${evidence.length}`}
          subtitle={
            active.uploadedByRole === "ADMIN"
              ? "Uploaded by staff"
              : "Uploaded by customer"
          }
          maxWidthClassName="max-w-[640px]"
          footer={
            evidence.length > 1 ? (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((i) =>
                      i === null
                        ? null
                        : (i - 1 + evidence.length) % evidence.length,
                    )
                  }
                  className="rounded-full border border-[var(--shop-border)] px-3 py-1.5 text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((i) =>
                      i === null ? null : (i + 1) % evidence.length,
                    )
                  }
                  className="rounded-full border border-[var(--shop-border)] px-3 py-1.5 text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)]"
                >
                  Next
                </button>
              </div>
            ) : undefined
          }
        >
          {isVideo(active) ? (
            <video
              src={active.url}
              controls
              className="max-h-[60vh] w-full rounded-lg"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- evidence image, not a next/image-managed asset
            <img
              src={active.url}
              alt="Evidence"
              className="max-h-[60vh] w-full rounded-lg object-contain"
            />
          )}
        </Modal>
      )}
    </>
  );
}
