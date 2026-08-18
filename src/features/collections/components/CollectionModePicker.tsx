import { Modal } from "@/shared/components/Modal";
import type { CollectionMode } from "./collection-mode";

type CollectionModePickerProps = {
  onClose: () => void;
  onChoose: (mode: CollectionMode) => void;
};

/** Create-mode gate: "what kind of collection is this?" before showing the full form — see CollectionFormModal. */
export function CollectionModePicker({
  onClose,
  onChoose,
}: CollectionModePickerProps) {
  return (
    <Modal
      onClose={onClose}
      title="New collection"
      subtitle="Choose a kind to get started"
      maxWidthClassName="max-w-[900px]"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
          >
            Cancel
          </button>
        </div>
      }
    >
      {/* Same max width as the form that follows — picking a kind and
          landing in the form should feel like one continuous modal, not a
          resize jump between two differently-sized screens. */}
      <div className="mx-auto flex max-w-lg flex-col gap-5 py-4">
        <p className="text-center text-xs text-[var(--shop-text-muted)]">
          You can change this later — it just decides which fields you see next.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onChoose("collection")}
            className="flex flex-col items-start gap-2 rounded-xl border border-[var(--shop-border)] p-5 text-left transition hover:border-[var(--shop-accent)] hover:shadow-sm"
          >
            <span className="text-sm font-bold text-[var(--shop-text)]">
              Collection
            </span>
            <span className="text-xs text-[var(--shop-text-muted)]">
              A group of similar products browsed together — e.g. &quot;Summer
              Dresses.&quot; Same category.
            </span>
          </button>
          <button
            type="button"
            onClick={() => onChoose("outfit")}
            className="flex flex-col items-start gap-2 rounded-xl border border-[var(--shop-border)] p-5 text-left transition hover:border-[var(--shop-accent)] hover:shadow-sm"
          >
            <span className="text-sm font-bold text-[var(--shop-text)]">
              Outfit / Look
            </span>
            <span className="text-xs text-[var(--shop-text-muted)]">
              Different pieces styled together as one look — e.g. dress + shoes
              + bag.
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
