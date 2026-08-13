"use client";

import { useEffect, useState } from "react";
import {
  X as XIcon,
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import {
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useAddCollectionItem,
  useRemoveCollectionItem,
  useReorderCollectionItems,
  useProductSearch,
} from "../hooks/useCollections";
import {
  COLLECTION_TYPES,
  type Collection,
  type CollectionItem,
  type CollectionType,
} from "../contracts/collections.contract";
import type { CollectionWriteInput } from "../api/collections.client";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";

const TYPE_OPTIONS: DropdownOption[] = COLLECTION_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0) + t.slice(1).toLowerCase().replace("_", " "),
}));

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

/** "Summer Sale" -> "summer-sale" */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CollectionFormModalProps = {
  /** Present = edit mode (seeded from this row). Absent = create mode. */
  collection?: Collection;
  onClose: () => void;
};

export function CollectionFormModal({
  collection,
  onClose,
}: CollectionFormModalProps) {
  const isEdit = Boolean(collection);

  const [title, setTitle] = useState(collection?.title ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [type, setType] = useState<CollectionType>(
    (collection?.type as CollectionType) ?? "LOOKBOOK",
  );
  const [description, setDescription] = useState(collection?.description ?? "");
  const [imageUrl, setImageUrl] = useState(collection?.imageUrl ?? "");
  const [isPublic, setIsPublic] = useState(collection?.isPublic ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local, not derived from the `collection` prop after mount — add/remove
  // mutations below update this list directly from their own response, so
  // it stays live without needing the whole `collection` prop to
  // re-fetch (which would risk clobbering an in-progress title/slug edit).
  const [items, setItems] = useState<CollectionItem[]>(collection?.items ?? []);
  const [productQuery, setProductQuery] = useState("");
  const [debouncedProductQuery, setDebouncedProductQuery] = useState("");

  // Keep the form synced if the underlying row refetches mid-edit.
  useEffect(() => {
    if (!collection) return;
    setTitle(collection.title);
    setSlug(collection.slug);
    setType((collection.type as CollectionType) ?? "LOOKBOOK");
    setDescription(collection.description ?? "");
    setImageUrl(collection.imageUrl ?? "");
    setIsPublic(collection.isPublic);
  }, [collection]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedProductQuery(productQuery), 300);
    return () => clearTimeout(id);
  }, [productQuery]);

  const onValidationError = (fields: Record<string, string[]>) => {
    const mapped: Record<string, string> = {};
    Object.entries(fields).forEach(([k, v]) => {
      mapped[k] = v[0] ?? "Invalid";
    });
    setErrors(mapped);
  };

  const { mutate: create, isPending: isCreating } = useCreateCollection({
    onValidationError,
  });
  const { mutate: update, isPending: isUpdating } = useUpdateCollection(
    collection?.id ?? "",
    { onValidationError },
  );
  const { mutate: remove, isPending: isDeleting } = useDeleteCollection();

  const { mutate: addItem, isPending: isAddingItem } = useAddCollectionItem(
    collection?.id ?? "",
  );
  const { mutate: removeItem, isPending: isRemovingItem } =
    useRemoveCollectionItem(collection?.id ?? "");
  const { mutate: reorderItems } = useReorderCollectionItems(
    collection?.id ?? "",
  );
  const { data: searchResults } = useProductSearch(debouncedProductQuery);
  const existingProductIds = new Set(items.map((i) => i.productId));
  const productResults = (searchResults ?? []).filter(
    (p) => !existingProductIds.has(p.id),
  );

  const handleAddProduct = (productId: string) => {
    // New items append after everything already loaded — omitting position
    // would default every add to 0 server-side, stacking them out of order.
    addItem(
      { productId, position: items.length },
      {
        onSuccess: (item) => {
          setItems((prev) => [...prev, item]);
          setProductQuery("");
          setDebouncedProductQuery("");
        },
      },
    );
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId, {
      onSuccess: () => setItems((prev) => prev.filter((i) => i.id !== itemId)),
    });
  };

  // Optimistic: reorder local state immediately (arrow clicks should feel
  // instant), then persist. Rolls back to the pre-swap order on failure —
  // the reorder mutation has no onValidationError/toast of its own to lean
  // on for that.
  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const previousItems = items;
    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setItems(reordered);

    reorderItems(
      reordered.map((item, i) => ({ id: item.id, position: i })),
      { onError: () => setItems(previousItems) },
    );
  };

  const isPending = isCreating || isUpdating || isDeleting;

  const dirty =
    !isEdit ||
    title !== collection!.title ||
    slug !== collection!.slug ||
    type !== collection!.type ||
    description !== (collection!.description ?? "") ||
    imageUrl !== (collection!.imageUrl ?? "") ||
    isPublic !== collection!.isPublic;

  const buildInput = (): CollectionWriteInput => ({
    title,
    // Collections have no server-side slugify fallback (unlike products), so
    // an empty field is always backfilled from the title client-side rather
    // than left blank.
    slug: slug.trim() || slugify(title),
    type,
    description: description.trim() || null,
    imageUrl: imageUrl.trim() || null,
    isPublic,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (isEdit) {
      update(buildInput(), { onSuccess: onClose });
    } else {
      create(buildInput(), { onSuccess: onClose });
    }
  };

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleConfirmDelete = () => {
    if (!collection) return;
    remove(collection.id, { onSuccess: onClose });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shop-ink)]/50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[520px] overflow-auto rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--shop-border)] p-6">
          <p className="shop-display text-[17px] font-semibold text-[var(--shop-text)]">
            {isEdit ? "Edit collection" : "New collection"}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[var(--shop-bg)] text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg-soft)]"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-6">
          <div className="col-span-2">
            <label className={labelClass}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Collection title"
              disabled={isPending}
              className={inputClass}
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-[var(--shop-danger)]">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={title ? slugify(title) : "auto-generated from title"}
              disabled={isPending}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Type</label>
            <Dropdown
              value={type}
              options={TYPE_OPTIONS}
              onChange={(v) => setType(v as CollectionType)}
              disabled={isPending}
              aria-label="Type"
            />
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              disabled={isPending}
              className={inputClass}
            />
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              disabled={isPending}
              className={inputClass}
            />
          </div>

          <label className="col-span-2 flex items-center gap-2 text-xs font-semibold text-[var(--shop-text)]">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isPending}
              className="accent-[var(--shop-ink)]"
            />
            Public (visible on the storefront)
          </label>

          {isEdit && (
            <div className="col-span-2 border-t border-[var(--shop-border)] pt-5">
              <label className={labelClass}>Items ({items.length})</label>
              <p className="-mt-1 mb-3 text-[11px] text-[var(--shop-text-muted)]">
                Adding, removing, or reordering items saves immediately — Cancel
                below only discards the fields above.
              </p>

              <div className="relative mb-3">
                <input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Search products to add…"
                  className={inputClass}
                />
                {debouncedProductQuery.trim().length >= 2 &&
                  productResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 max-h-56 overflow-y-auto rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] p-1 shadow-lg">
                      {productResults.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleAddProduct(p.id)}
                          disabled={isAddingItem}
                          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-[var(--shop-text)] hover:bg-[var(--shop-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {p.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                            <img
                              src={p.thumbnailUrl}
                              alt=""
                              className="h-7 w-7 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="h-7 w-7 shrink-0 rounded bg-[var(--shop-bg-soft)]" />
                          )}
                          <span className="min-w-0 flex-1 truncate">
                            {p.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-[var(--shop-text-muted)]">
                  No products in this collection yet.
                </p>
              ) : (
                <div className="max-h-52 space-y-1.5 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 rounded-lg border border-[var(--shop-border)] px-2.5 py-2"
                    >
                      <div className="flex shrink-0 flex-col">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${item.product.title} up`}
                          className="flex h-3.5 w-4 items-center justify-center text-[var(--shop-text-muted)] hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronUpIcon className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 1)}
                          disabled={index === items.length - 1}
                          aria-label={`Move ${item.product.title} down`}
                          className="flex h-3.5 w-4 items-center justify-center text-[var(--shop-text-muted)] hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronDownIcon className="h-3 w-3" />
                        </button>
                      </div>
                      {item.product.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                        <img
                          src={item.product.thumbnailUrl}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 shrink-0 rounded bg-[var(--shop-bg-soft)]" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--shop-text)]">
                        {item.product.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRemovingItem}
                        aria-label={`Remove ${item.product.title}`}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-danger-bg)] hover:text-[var(--shop-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {confirmingDelete ? (
            <div className="col-span-2 flex items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
              <p className="flex-1 text-[13px] font-semibold text-[var(--shop-danger)]">
                Delete &quot;{collection?.title}&quot;? This can&apos;t be
                undone.
              </p>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isPending}
                className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="rounded-lg bg-[var(--shop-danger)] px-4 py-2.5 text-[13px] font-bold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isDeleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          ) : (
            <div className="col-span-2 flex items-center gap-2.5 border-t border-[var(--shop-border)] pt-5">
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={isPending}
                  className="rounded-lg border border-[var(--shop-danger)]/30 px-4 py-2.5 text-[13px] font-bold text-[var(--shop-danger)] hover:bg-[var(--shop-danger-bg)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete collection
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !dirty || !title.trim()}
                className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isCreating || isUpdating
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Create collection"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
