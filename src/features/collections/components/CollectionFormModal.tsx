"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search as SearchIcon,
  Upload as UploadIcon,
  Loader2 as Loader2Icon,
} from "lucide-react";
import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useAddCollectionItem,
  useUpdateCollectionItem,
  useRemoveCollectionItem,
  useReorderCollectionItems,
  useProductSearch,
  useCategoryOptions,
} from "../hooks/useCollections";
import {
  COLLECTION_TYPES,
  type Collection,
  type CollectionItem,
  type CollectionType,
  type ProductSearchResult,
} from "../contracts/collections.contract";
import {
  addCollectionItem,
  uploadCollectionImage,
  type CollectionWriteInput,
} from "../api/collections.client";
import { collectionsKeys } from "../api/collections.keys";
import { notify } from "@/shared/lib/notify";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";
import { Modal } from "@/shared/components/Modal";
import {
  MODE_TYPES,
  modeForType,
  type CollectionMode,
} from "./collection-mode";
import { CollectionModePicker } from "./CollectionModePicker";
import { CollectionProductSearchBar } from "./CollectionProductSearchBar";
import { CollectionItemRow } from "./CollectionItemRow";

const TYPE_OPTIONS: DropdownOption[] = COLLECTION_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0) + t.slice(1).toLowerCase().replace("_", " "),
}));

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

// Sentinel for "no featured category" in the dropdown — sent to the backend
// as `categoryId: null`, same convention as ProductFormModal's NO_CATEGORY.
const NO_CATEGORY = "";

// Sentinel for "top-level, no parent" in the dropdown — sent to the backend
// as `parentId: null`.
const NO_PARENT = "";

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
  /** Create mode only — pre-fills the item list, e.g. from a product-table bulk selection. Ignored when `collection` is set. */
  initialProducts?: ProductSearchResult[];
  /** Create mode only — skips the Collection/Outfit mode picker and starts on this mode. Ignored when `collection` is set. */
  initialMode?: CollectionMode;
  onClose: () => void;
};

export function CollectionFormModal({
  collection,
  initialProducts,
  initialMode,
  onClose,
}: CollectionFormModalProps) {
  const isEdit = Boolean(collection);

  const [title, setTitle] = useState(collection?.title ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [type, setType] = useState<CollectionType>(
    (collection?.type as CollectionType) ??
      (initialMode ? MODE_TYPES[initialMode][0] : "LOOKBOOK"),
  );
  const [description, setDescription] = useState(collection?.description ?? "");
  const [imageUrl, setImageUrl] = useState(collection?.imageUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [isPublic, setIsPublic] = useState(collection?.isPublic ?? true);
  const [categoryId, setCategoryId] = useState(
    collection?.categoryId ?? NO_CATEGORY,
  );
  const [parentId, setParentId] = useState(collection?.parentId ?? NO_PARENT);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Gates a brand-new collection behind a "what kind of collection is
  // this?" picker so a same-category grid and a slotted outfit/look don't
  // share one undifferentiated form. In edit mode it's derived from the
  // row's existing `type` instead of picked — same grouping, so the mode
  // toggle and scoped Type dropdown below stay in sync with whatever the
  // collection was actually created as.
  const [mode, setMode] = useState<CollectionMode | null>(
    isEdit && collection
      ? modeForType(collection.type as CollectionType)
      : (initialMode ?? null),
  );
  // Collapsed by default only when there's no category set yet AND the mode
  // is Outfit — "featured category" reads as "which category is this
  // outfit" there, which isn't what it means (see the categoryId comment
  // below). Never collapses a category that's already been chosen.
  const [categoryDisclosureOpen, setCategoryDisclosureOpen] = useState(
    Boolean(collection?.categoryId) || mode !== "outfit",
  );

  const chooseMode = (next: CollectionMode) => {
    setMode(next);
    setType(MODE_TYPES[next][0]);
    setCategoryDisclosureOpen(next !== "outfit" || Boolean(categoryId));
  };

  // Local, not derived from the `collection` prop after mount — add/remove
  // mutations below update this list directly from their own response, so
  // it stays live without needing the whole `collection` prop to
  // re-fetch (which would risk clobbering an in-progress title/slug edit).
  const [items, setItems] = useState<CollectionItem[]>(collection?.items ?? []);
  // Create-mode only: products picked before the collection exists yet, so
  // there's no collectionId to attach them to until the create call
  // succeeds. Attached in a batch of addCollectionItem calls right after —
  // slot/isOptional are held here too since there's no item row to persist
  // them to until then.
  const [pendingItems, setPendingItems] = useState<
    { product: ProductSearchResult; slot: string; isOptional: boolean }[]
  >(
    (initialProducts ?? []).map((product) => ({
      product,
      slot: "",
      isOptional: false,
    })),
  );
  // Snapshot of each item's slot at focus time, so a failed save can revert
  // to the last known-good value instead of the just-typed one still sitting
  // in local state (see handleSlotBlur's onError).
  const slotBeforeEditRef = useRef<Map<string, string | null>>(new Map());
  const [productQuery, setProductQuery] = useState("");
  const [debouncedProductQuery, setDebouncedProductQuery] = useState("");
  // Filters the item picker by the *product's own* category (e.g. narrow to
  // "Shoes" while building an outfit) — unrelated to the collection-level
  // "Featured category" field above, which is about storefront placement.
  const [productCategoryFilter, setProductCategoryFilter] =
    useState(NO_CATEGORY);
  const queryClient = useQueryClient();

  // Keep the form synced if the underlying row refetches mid-edit.
  useEffect(() => {
    if (!collection) return;
    setTitle(collection.title);
    setSlug(collection.slug);
    setType((collection.type as CollectionType) ?? "LOOKBOOK");
    setDescription(collection.description ?? "");
    setImageUrl(collection.imageUrl ?? "");
    setIsPublic(collection.isPublic);
    setCategoryId(collection.categoryId ?? NO_CATEGORY);
    setParentId(collection.parentId ?? NO_PARENT);
    setMode(modeForType(collection.type as CollectionType));
    setCategoryDisclosureOpen(
      Boolean(collection.categoryId) ||
        modeForType(collection.type as CollectionType) !== "outfit",
    );
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
  const { mutate: updateItem } = useUpdateCollectionItem(collection?.id ?? "");
  const { data: searchResults } = useProductSearch(
    debouncedProductQuery,
    productCategoryFilter || undefined,
  );
  const { data: categoryOptions } = useCategoryOptions();
  const categoryDropdownOptions: DropdownOption[] = [
    { value: NO_CATEGORY, label: "No category" },
    ...(categoryOptions ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];
  const productCategoryDropdownOptions: DropdownOption[] = [
    { value: NO_CATEGORY, label: "All categories" },
    ...(categoryOptions ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  // Only top-level collections are valid parents — keeps nesting to the two
  // levels CollectionRepository's `collectionWithItems` include eagerly
  // loads (a LOOKBOOK's children aren't queried for their own children).
  const { data: parentCandidates } = useCollections({ limit: 100 });
  const parentDropdownOptions: DropdownOption[] = [
    { value: NO_PARENT, label: "No parent (top-level)" },
    ...(parentCandidates?.items ?? [])
      .filter((c) => c.id !== collection?.id)
      .map((c) => ({ value: c.id, label: c.title })),
  ];

  // Create mode has no collectionId yet, so picked products live in
  // `pendingItems` and only get attached (via a batch of addCollectionItem
  // calls) once the create call below succeeds. Normalized to the same shape
  // as `items` so the list/search UI below doesn't need a second branch.
  const displayItems: CollectionItem[] = isEdit
    ? items
    : pendingItems.map((p, index) => ({
        id: p.product.id,
        productId: p.product.id,
        position: index,
        slot: p.slot || null,
        isOptional: p.isOptional,
        product: p.product,
      }));

  const existingProductIds = new Set(displayItems.map((i) => i.productId));
  const productResults = (searchResults ?? []).filter(
    (p) => !existingProductIds.has(p.id),
  );

  const handleAddProduct = (productId: string) => {
    if (isEdit) {
      // New items append after everything already loaded — omitting
      // position would default every add to 0 server-side, stacking them
      // out of order.
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
      return;
    }
    const product = productResults.find((p) => p.id === productId);
    if (!product) return;
    setPendingItems((prev) => [
      ...prev,
      { product, slot: "", isOptional: false },
    ]);
    setProductQuery("");
    setDebouncedProductQuery("");
  };

  const handleRemoveItem = (itemId: string) => {
    if (isEdit) {
      removeItem(itemId, {
        onSuccess: () =>
          setItems((prev) => prev.filter((i) => i.id !== itemId)),
      });
      return;
    }
    setPendingItems((prev) => prev.filter((p) => p.product.id !== itemId));
  };

  /** Slot commits on blur (not per-keystroke) once in edit mode — create-mode just holds it in local state until the batch attach on create. */
  const handleSlotChange = (itemId: string, slot: string) => {
    if (isEdit) {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, slot: slot || null } : i)),
      );
      return;
    }
    setPendingItems((prev) =>
      prev.map((p) => (p.product.id === itemId ? { ...p, slot } : p)),
    );
  };

  const handleSlotFocus = (itemId: string, slot: string | null) => {
    slotBeforeEditRef.current.set(itemId, slot);
  };

  const handleSlotBlur = (itemId: string, slot: string) => {
    if (!isEdit) return;
    const nextSlot = slot.trim() || null;
    updateItem(
      { itemId, slot: nextSlot },
      {
        onError: () => {
          const previous = slotBeforeEditRef.current.get(itemId) ?? null;
          setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, slot: previous } : i)),
          );
        },
      },
    );
  };

  const handleOptionalToggle = (itemId: string, isOptional: boolean) => {
    if (isEdit) {
      const previous = items.find((i) => i.id === itemId)?.isOptional ?? false;
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isOptional } : i)),
      );
      updateItem(
        { itemId, isOptional },
        {
          onError: () => {
            setItems((prev) =>
              prev.map((i) =>
                i.id === itemId ? { ...i, isOptional: previous } : i,
              ),
            );
          },
        },
      );
      return;
    }
    setPendingItems((prev) =>
      prev.map((p) => (p.product.id === itemId ? { ...p, isOptional } : p)),
    );
  };

  // Optimistic: reorder local state immediately (arrow clicks should feel
  // instant), then persist. Rolls back to the pre-swap order on failure —
  // the reorder mutation has no onValidationError/toast of its own to lean
  // on for that.
  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= displayItems.length) return;

    if (isEdit) {
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
      return;
    }

    const reordered = [...pendingItems];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setPendingItems(reordered);
  };

  const isPending = isCreating || isUpdating || isDeleting;

  const dirty =
    !isEdit ||
    title !== collection!.title ||
    slug !== collection!.slug ||
    type !== collection!.type ||
    description !== (collection!.description ?? "") ||
    imageUrl !== (collection!.imageUrl ?? "") ||
    isPublic !== collection!.isPublic ||
    categoryId !== (collection!.categoryId ?? NO_CATEGORY) ||
    parentId !== (collection!.parentId ?? NO_PARENT);

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
    categoryId: categoryId || null,
    parentId: parentId || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (isEdit) {
      update(buildInput(), { onSuccess: onClose });
      return;
    }
    create(buildInput(), {
      onSuccess: async (created) => {
        if (pendingItems.length === 0) {
          onClose();
          return;
        }
        try {
          await Promise.all(
            pendingItems.map((p, index) =>
              addCollectionItem(created.id, p.product.id, index, {
                slot: p.slot.trim() || null,
                isOptional: p.isOptional,
              }),
            ),
          );
          queryClient.invalidateQueries({ queryKey: collectionsKeys.lists() });
        } catch {
          notify.error(
            "Collection created, but some products couldn't be attached. Open it again to retry.",
          );
        }
        onClose();
      },
    });
  };

  /** Cover image can be set by pasting a URL, uploading a file, or picking a selected product's thumbnail. */
  const handleSetCover = (url: string | null) => {
    if (!url) return;
    setImageUrl(url);
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadCollectionImage(file, {
        slug: slug.trim() || slugify(title) || "collection",
        productIds: displayItems.map((i) => i.productId),
      });
      setImageUrl(url);
    } catch {
      notify.error("Image upload failed. Try again or paste a URL instead.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleConfirmDelete = () => {
    if (!collection) return;
    remove(collection.id, { onSuccess: onClose });
  };

  if (!isEdit && mode === null) {
    return <CollectionModePicker onClose={onClose} onChoose={chooseMode} />;
  }

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Edit collection" : "New collection"}
      subtitle={isEdit ? collection?.title : undefined}
      maxWidthClassName="max-w-[900px]"
      footer={
        confirmingDelete ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
            <p className="flex-1 text-[13px] font-semibold text-[var(--shop-danger)]">
              Delete &quot;{collection?.title}&quot;? This can&apos;t be undone.
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
          <div className="flex items-center gap-2.5">
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
              form="collection-form"
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
        )
      }
    >
      <form
        id="collection-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 md:flex-row md:gap-8"
      >
        {/* Left: collection details */}
        <div className="flex w-full shrink-0 flex-col gap-4 md:w-[300px]">
          <div>
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
            <label className={labelClass}>Kind</label>
            <div
              role="radiogroup"
              aria-label="Collection kind"
              className="inline-flex w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-bg-soft)] p-0.5"
            >
              {(["collection", "outfit"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  disabled={isPending}
                  onClick={() => mode !== m && chooseMode(m)}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    mode === m
                      ? "bg-[var(--shop-surface)] text-[var(--shop-text)] shadow-sm"
                      : "text-[var(--shop-text-muted)] hover:text-[var(--shop-text)]"
                  }`}
                >
                  {m === "collection" ? "Collection" : "Outfit"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={title ? slugify(title) : "auto"}
                disabled={isPending}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <Dropdown
                value={type}
                options={
                  mode
                    ? TYPE_OPTIONS.filter((o) =>
                        MODE_TYPES[mode].includes(o.value as CollectionType),
                      )
                    : TYPE_OPTIONS
                }
                onChange={(v) => setType(v as CollectionType)}
                disabled={isPending}
                aria-label="Type"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Featured category</label>
            {categoryDisclosureOpen ? (
              <>
                <Dropdown
                  value={categoryId}
                  options={categoryDropdownOptions}
                  onChange={setCategoryId}
                  disabled={isPending}
                  aria-label="Featured category"
                />
                {mode === "outfit" && (
                  <p className="mt-1 text-[10.5px] text-[var(--shop-text-muted)]">
                    Optional — a category page to feature this look under.
                    Doesn&apos;t restrict which items you add.
                  </p>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setCategoryDisclosureOpen(true)}
                className="text-[11px] font-semibold text-[var(--shop-accent)] hover:underline"
              >
                + Feature under a category page
              </button>
            )}
          </div>

          <div>
            <label className={labelClass}>Parent collection</label>
            <Dropdown
              value={parentId}
              options={parentDropdownOptions}
              onChange={setParentId}
              disabled={isPending}
              aria-label="Parent collection"
            />
            <p className="mt-1 text-[10.5px] text-[var(--shop-text-muted)]">
              e.g. nest an Outfit under a Lookbook for &quot;Shop the
              Look&quot;.
            </p>
          </div>

          <div>
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

          <div>
            <label className={labelClass}>Image URL</label>
            <div className="flex items-start gap-3">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://… or upload a file"
                disabled={isPending || isUploadingImage}
                className={inputClass}
              />
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageFileInputRef.current?.click()}
                disabled={isPending || isUploadingImage}
                title="Upload an image"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--shop-border)] text-[var(--shop-text-muted)] transition hover:border-[var(--shop-accent)] hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <UploadIcon className="h-4 w-4" />
                )}
              </button>
              {imageUrl.trim() && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL, not a local asset next/image can optimize
                <img
                  src={imageUrl.trim()}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-lg border border-[var(--shop-border)] object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.visibility = "visible";
                  }}
                />
              )}
            </div>
            {/* Uploading sets imageUrl directly from the returned S3 url —
                this row is a quicker alternative for combined-look covers
                that don't need a dedicated upload, reusing a photo that's
                already hosted. */}
            {displayItems.some((i) => i.product.thumbnailUrl) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mr-0.5 text-[10px] text-[var(--shop-text-muted)]">
                  Or use a product photo:
                </span>
                {displayItems
                  .filter((i) => i.product.thumbnailUrl)
                  .map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => handleSetCover(i.product.thumbnailUrl)}
                      title={`Use ${i.product.title}'s photo as the cover`}
                      className={`h-9 w-9 shrink-0 overflow-hidden rounded-lg border ${
                        imageUrl.trim() === i.product.thumbnailUrl
                          ? "border-[var(--shop-accent)] ring-1 ring-[var(--shop-accent)]"
                          : "border-[var(--shop-border)] hover:border-[var(--shop-accent)]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize */}
                      <img
                        src={i.product.thumbnailUrl ?? undefined}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--shop-text)]">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isPending}
              className="accent-[var(--shop-ink)]"
            />
            Public (visible on the storefront)
          </label>
        </div>

        {/* Divider */}
        <div className="hidden shrink-0 self-stretch border-l border-[var(--shop-border)] md:block" />

        {/* Right: items */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]">
              Items ({displayItems.length})
            </label>
            <p className="text-[11px] text-[var(--shop-text-muted)]">
              {isEdit ? "Saves immediately" : "Attached on create"}
            </p>
          </div>

          <CollectionProductSearchBar
            query={productQuery}
            onQueryChange={setProductQuery}
            debouncedQuery={debouncedProductQuery}
            categoryFilter={productCategoryFilter}
            onCategoryFilterChange={setProductCategoryFilter}
            categoryOptions={productCategoryDropdownOptions}
            results={productResults}
            onAdd={handleAddProduct}
            addDisabled={isAddingItem}
          />

          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--shop-border)] px-6 py-14 text-center">
              <SearchIcon
                className="h-5 w-5 text-[var(--shop-text-muted)]"
                strokeWidth={1.75}
              />
              <p className="text-xs font-semibold text-[var(--shop-text)]">
                No items yet
              </p>
              <p className="max-w-[280px] text-[11px] text-[var(--shop-text-muted)]">
                {mode === "outfit"
                  ? "Search above and add the pieces that make up this look."
                  : "Search above to start adding products."}
              </p>
            </div>
          ) : (
            <div className="max-h-[440px] space-y-1.5 overflow-y-auto">
              {displayItems.map((item, index) => (
                <CollectionItemRow
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === displayItems.length - 1}
                  removeDisabled={isEdit && isRemovingItem}
                  onMoveUp={() => handleMoveItem(index, -1)}
                  onMoveDown={() => handleMoveItem(index, 1)}
                  onSlotFocus={(slot) => handleSlotFocus(item.id, slot)}
                  onSlotChange={(slot) => handleSlotChange(item.id, slot)}
                  onSlotBlur={(slot) => handleSlotBlur(item.id, slot)}
                  onOptionalToggle={(isOptional) =>
                    handleOptionalToggle(item.id, isOptional)
                  }
                  onSetCover={handleSetCover}
                  onRemove={() => handleRemoveItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
