"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  X as XIcon,
  Plus as PlusIcon,
  Star as StarIcon,
  Upload as UploadIcon,
  Loader2 as Loader2Icon,
} from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategoryOptions,
  useProductMedia,
  useCreateProductMedia,
  useUpdateProductMedia,
  useDeleteProductMedia,
} from "../hooks/useProducts";
import { usePricingRules } from "../hooks/usePricingRules";
import {
  ProductStatusSchema,
  ProductVisibilitySchema,
  MediaTypeSchema,
  type AdminProduct,
  type AdminProductMedia,
  type MediaType,
  type ProductStatus,
  type ProductVisibility,
} from "../contracts/products.contract";
import {
  createProductMedia,
  uploadProductImage,
  type ProductWriteInput,
  type MediaWriteInput,
} from "../api/products.client";
import { productsKeys } from "../api/products.keys";
import { notify } from "@/shared/lib/notify";
import { STATUS_STYLES, VISIBILITY_LABELS } from "../lib/presentation";
import { Dropdown, type DropdownOption } from "@/shared/components/Dropdown";

const STATUS_OPTIONS: DropdownOption[] = ProductStatusSchema.options.map(
  (s) => ({
    value: s,
    label: STATUS_STYLES[s].label,
    indicatorColor: STATUS_STYLES[s].color,
  }),
);

const VISIBILITY_OPTIONS: DropdownOption[] =
  ProductVisibilitySchema.options.map((v) => ({
    value: v,
    label: VISIBILITY_LABELS[v],
  }));

const MEDIA_TYPE_OPTIONS: DropdownOption[] = MediaTypeSchema.options.map(
  (t) => ({
    value: t,
    label: t.charAt(0) + t.slice(1).toLowerCase(),
  }),
);

const NO_CATEGORY = "";
const NO_PRICING_RULE = "";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

// No `w-full` here (unlike `inputClass`) — both call sites are flex-row
// items that set their own width (`flex-1` / `w-24`), and a trailing
// `w-full` would win the cascade over those regardless of class-string
// order (Tailwind's width utilities are emitted in a fixed stylesheet
// order, not source order), stretching the row and overflowing it.
const smallInputClass =
  "rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1.5 text-[11px] text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

/** Local editable mirror of a media row — `id` is only set once persisted (edit mode). */
type MediaRow = {
  key: string;
  id?: string;
  url: string;
  type: MediaType;
  altText: string;
  isPrimary: boolean;
};

function toMediaRow(m: AdminProductMedia): MediaRow {
  return {
    key: m.id,
    id: m.id,
    url: m.url,
    type: m.type,
    altText: m.altText ?? "",
    isPrimary: m.isPrimary,
  };
}

function blankMediaRow(): MediaRow {
  return {
    key: crypto.randomUUID(),
    url: "",
    type: "IMAGE",
    altText: "",
    isPrimary: false,
  };
}

function toMediaWriteInput(row: MediaRow, position: number): MediaWriteInput {
  return {
    url: row.url.trim(),
    type: row.type,
    altText: row.altText.trim() || null,
    position,
    isPrimary: row.isPrimary,
  };
}

type ProductFormModalProps = {
  /** Present = edit mode (seeded from this row). Absent = create mode. */
  product?: AdminProduct;
  onClose: () => void;
};

/**
 * Parses a form's numeric input string to a number, or null when blank —
 * null (not undefined) so a cleared field is sent as "clear this value"
 * rather than being dropped from the request entirely. See ProductWriteInput.
 */
function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.category?.id ?? NO_CATEGORY,
  );
  const { data: pricingRules } = usePricingRules();
  // Create mode pre-selects the tenant's default rule (if any) so a new
  // product visibly starts with the same markup "apply to all" promised —
  // the admin can still swap it for a different rule or "No pricing rule"
  // right here. Edit mode just mirrors whatever the product already has.
  const [pricingRuleId, setPricingRuleId] = useState(
    product?.pricingRule?.id ?? NO_PRICING_RULE,
  );
  // Tracks a deliberate admin choice, not "has this run yet" — the query can
  // resolve at any time relative to the admin's own clicks, so gating on
  // "did the user touch this" (rather than "did we already auto-select
  // once") is what stops a late-arriving default from clobbering a manual
  // pick made while pricingRules was still loading.
  const [pricingRuleTouched, setPricingRuleTouched] = useState(isEdit);
  useEffect(() => {
    if (pricingRuleTouched || !pricingRules) return;
    const defaultRule = pricingRules.find((r) => r.isDefault);
    if (defaultRule) setPricingRuleId(defaultRule.id);
  }, [pricingRuleTouched, pricingRules]);
  const [status, setStatus] = useState<ProductStatus>(
    product?.status ?? "DRAFT",
  );
  const [visibility, setVisibility] = useState<ProductVisibility>(
    product?.visibility ?? "PUBLIC",
  );
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [salePrice, setSalePrice] = useState(
    product?.salePrice?.toString() ?? "",
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice?.toString() ?? "",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnailUrl ?? "");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep the form synced if the underlying row refetches mid-edit.
  useEffect(() => {
    if (!product) return;
    setTitle(product.title);
    setSlug(product.slug);
    setBrand(product.brand ?? "");
    setCategoryId(product.category?.id ?? NO_CATEGORY);
    setPricingRuleId(product.pricingRule?.id ?? NO_PRICING_RULE);
    setStatus(product.status);
    setVisibility(product.visibility);
    setPrice(product.price?.toString() ?? "");
    setSalePrice(product.salePrice?.toString() ?? "");
    setCompareAtPrice(product.compareAtPrice?.toString() ?? "");
    setThumbnailUrl(product.thumbnailUrl ?? "");
  }, [product]);

  // Local mirror of media rows — edit mode seeds this once from the fetched
  // list (below), then add/edit/remove update it directly from each
  // mutation's own response, same reasoning as CollectionFormModal's `items`:
  // re-deriving from a live-refetching query would risk clobbering an
  // in-progress edit mid-typing. Create mode starts empty; everything in it
  // is "pending" until the product itself is created.
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [mediaSeeded, setMediaSeeded] = useState(false);
  // Which row is mid-autosave — drives a small inline spinner instead of a
  // page-wide pending state, since multiple rows can never save at once
  // (each save is triggered by leaving that row's own field).
  const [savingMediaKey, setSavingMediaKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: fetchedMedia } = useProductMedia(product?.id ?? "");
  useEffect(() => {
    if (isEdit && fetchedMedia && !mediaSeeded) {
      setMedia(fetchedMedia.map(toMediaRow));
      setMediaSeeded(true);
    }
  }, [isEdit, fetchedMedia, mediaSeeded]);

  const { mutate: createMedia } = useCreateProductMedia(product?.id ?? "");
  const { mutate: updateMedia } = useUpdateProductMedia(product?.id ?? "");
  const { mutate: removeMedia, isPending: isRemovingMedia } =
    useDeleteProductMedia(product?.id ?? "");

  const handleAddMedia = () => {
    setMedia((prev) => [...prev, blankMediaRow()]);
  };

  const handleRemoveMedia = (row: MediaRow) => {
    if (isEdit && row.id) {
      removeMedia(row.id, {
        onSuccess: () =>
          setMedia((prev) => prev.filter((r) => r.key !== row.key)),
      });
      return;
    }
    setMedia((prev) => prev.filter((r) => r.key !== row.key));
  };

  const handleMediaFieldChange = (
    key: string,
    field: "url" | "altText",
    value: string,
  ) => {
    setMedia((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  };

  /**
   * Persists one row — edit mode only (create mode's rows are all attached
   * in bulk after the product itself is created, see handleSubmit). Fires
   * automatically from field blur/change instead of a per-row Save button,
   * so editing 12+ images doesn't mean 12+ extra clicks.
   */
  const handleSaveMedia = (row: MediaRow) => {
    if (!isEdit || !row.url.trim()) return;

    const position = media.findIndex((r) => r.key === row.key);
    const input = toMediaWriteInput(row, position);
    setSavingMediaKey(row.key);

    if (row.id) {
      updateMedia(
        { mediaId: row.id, input },
        {
          onSuccess: (updated) =>
            setMedia((prev) =>
              prev.map((r) => (r.key === row.key ? toMediaRow(updated) : r)),
            ),
          onSettled: () => setSavingMediaKey(null),
        },
      );
      return;
    }
    createMedia(input, {
      onSuccess: (created) =>
        setMedia((prev) =>
          prev.map((r) => (r.key === row.key ? toMediaRow(created) : r)),
        ),
      onSettled: () => setSavingMediaKey(null),
    });
  };

  const handleMediaTypeChange = (row: MediaRow, type: MediaType) => {
    const updated = { ...row, type };
    setMedia((prev) => prev.map((r) => (r.key === row.key ? updated : r)));
    handleSaveMedia(updated);
  };

  /**
   * Marks this row primary and unmarks every other row — the backend does
   * the same unset-others-then-set step and also mirrors the URL onto the
   * product's plain `thumbnailUrl` field, so this keeps that field in sync
   * in the currently open form too.
   */
  const handleSetPrimary = (row: MediaRow) => {
    if (isEdit && row.id) {
      updateMedia(
        { mediaId: row.id, input: { isPrimary: true } },
        {
          onSuccess: (updated) => {
            setMedia((prev) =>
              prev.map((r) =>
                r.key === row.key
                  ? toMediaRow(updated)
                  : { ...r, isPrimary: false },
              ),
            );
            setThumbnailUrl(updated.url);
          },
        },
      );
      return;
    }
    setMedia((prev) =>
      prev.map((r) => ({ ...r, isPrimary: r.key === row.key })),
    );
    setThumbnailUrl(row.url);
  };

  const { data: categoryOptions } = useCategoryOptions();
  const categoryDropdownOptions: DropdownOption[] = [
    { value: NO_CATEGORY, label: "No category" },
    ...(categoryOptions ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  const pricingRuleDropdownOptions: DropdownOption[] = [
    { value: NO_PRICING_RULE, label: "No pricing rule" },
    ...(pricingRules ?? []).map((r) => ({
      value: r.id,
      label: `${r.name} (${r.markupValue}%)${r.isDefault ? " — default" : ""}`,
    })),
  ];

  const onValidationError = (fields: Record<string, string[]>) => {
    const mapped: Record<string, string> = {};
    Object.entries(fields).forEach(([k, v]) => {
      mapped[k] = v[0] ?? "Invalid";
    });
    setErrors(mapped);
  };

  const { mutate: create, isPending: isCreating } = useCreateProduct({
    onValidationError,
  });
  const { mutate: update, isPending: isUpdating } = useUpdateProduct(
    product?.id ?? "",
    { onValidationError },
  );
  const { mutate: remove, isPending: isDeleting } = useDeleteProduct();

  const isPending = isCreating || isUpdating || isDeleting;

  const dirty =
    !isEdit ||
    title !== product!.title ||
    slug !== product!.slug ||
    brand !== (product!.brand ?? "") ||
    categoryId !== (product!.category?.id ?? NO_CATEGORY) ||
    pricingRuleId !== (product!.pricingRule?.id ?? NO_PRICING_RULE) ||
    status !== product!.status ||
    visibility !== product!.visibility ||
    price !== (product!.price?.toString() ?? "") ||
    salePrice !== (product!.salePrice?.toString() ?? "") ||
    compareAtPrice !== (product!.compareAtPrice?.toString() ?? "") ||
    thumbnailUrl !== (product!.thumbnailUrl ?? "");

  const buildInput = (): ProductWriteInput => ({
    title,
    // slug intentionally stays `undefined` (not null) when blank — omitting
    // it means "leave the existing slug alone" on update, and "derive one
    // from the title" on create (see ProductService.createProduct). Slugs
    // are never meant to be explicitly cleared to null.
    slug: slug.trim() || undefined,
    brand: brand.trim() || null,
    categoryId: categoryId || null,
    pricingRuleId: pricingRuleId || null,
    status,
    visibility,
    price: parseOptionalNumber(price),
    salePrice: parseOptionalNumber(salePrice),
    compareAtPrice: parseOptionalNumber(compareAtPrice),
    thumbnailUrl: thumbnailUrl.trim() || null,
  });

  const handleThumbnailFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const url = await uploadProductImage(file, {
        slug: slug.trim() || title.trim() || "product",
        productId: product?.id,
      });
      setThumbnailUrl(url);
    } catch {
      notify.error("Image upload failed. Try again or paste a URL instead.");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (isEdit) {
      update(buildInput(), { onSuccess: onClose });
      return;
    }

    create(buildInput(), {
      onSuccess: async (created) => {
        const pendingMedia = media.filter((r) => r.url.trim());
        if (pendingMedia.length === 0) {
          onClose();
          return;
        }
        try {
          await Promise.all(
            pendingMedia.map((r, i) =>
              createProductMedia(created.id, toMediaWriteInput(r, i)),
            ),
          );
          queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
        } catch {
          notify.error(
            "Product created, but some media couldn't be attached. Open it again to retry.",
          );
        }
        onClose();
      },
    });
  };

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleConfirmDelete = () => {
    if (!product) return;
    remove(product.id, { onSuccess: onClose });
  };

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Edit product" : "New product"}
      subtitle={isEdit ? product?.title : undefined}
      maxWidthClassName="max-w-[760px]"
      footer={
        confirmingDelete ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
            <p className="flex-1 text-[13px] font-semibold text-[var(--shop-danger)]">
              Delete &quot;{product?.title}&quot;? This can&apos;t be undone.
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
                Delete product
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
              form="product-form"
              disabled={isPending || !dirty || !title.trim()}
              className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isCreating || isUpdating
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create product"}
            </button>
          </div>
        )
      }
    >
      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4"
      >
        <div className="col-span-2">
          <label className={labelClass}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product title"
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
            placeholder={title || "auto-generated from title"}
            disabled={isPending}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Brand</label>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand"
            disabled={isPending}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <Dropdown
            value={categoryId}
            options={categoryDropdownOptions}
            onChange={setCategoryId}
            disabled={isPending}
            aria-label="Category"
          />
        </div>

        <div>
          <label className={labelClass}>Pricing rule</label>
          <Dropdown
            value={pricingRuleId}
            options={pricingRuleDropdownOptions}
            onChange={(v) => {
              setPricingRuleId(v);
              setPricingRuleTouched(true);
            }}
            disabled={isPending}
            aria-label="Pricing rule"
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <Dropdown
            value={status}
            options={STATUS_OPTIONS}
            onChange={(v) => setStatus(v as ProductStatus)}
            disabled={isPending}
            aria-label="Status"
          />
        </div>

        <div>
          <label className={labelClass}>Visibility</label>
          <Dropdown
            value={visibility}
            options={VISIBILITY_OPTIONS}
            onChange={(v) => setVisibility(v as ProductVisibility)}
            disabled={isPending}
            aria-label="Visibility"
          />
        </div>

        <div>
          <label className={labelClass}>Price</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            disabled={isPending}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Sale price</label>
          <input
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            disabled={isPending}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Compare-at price</label>
          <input
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            disabled={isPending}
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Thumbnail URL</label>
          <div className="flex items-start gap-3">
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://… or upload a file"
              disabled={isPending || isUploadingThumbnail}
              className={inputClass}
            />
            <input
              ref={thumbnailFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleThumbnailFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => thumbnailFileInputRef.current?.click()}
              disabled={isPending || isUploadingThumbnail}
              title="Upload an image"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--shop-border)] text-[var(--shop-text-muted)] transition hover:border-[var(--shop-accent)] hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploadingThumbnail ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <UploadIcon className="h-4 w-4" />
              )}
            </button>
            {thumbnailUrl.trim() && (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL, not a local asset next/image can optimize
              <img
                src={thumbnailUrl.trim()}
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
        </div>

        <div className="col-span-2 border-t border-[var(--shop-border)] pt-5">
          <label className={labelClass}>Media gallery ({media.length})</label>
          <p className="-mt-1 mb-3 text-[11px] text-[var(--shop-text-muted)]">
            {isEdit
              ? "Changes save as you leave a field. The starred image is also used as the thumbnail above."
              : "Media added here is attached once you create the product below."}
          </p>

          {media.length === 0 ? (
            <p className="text-xs text-[var(--shop-text-muted)]">
              No media yet.
            </p>
          ) : (
            <div className="shop-scrollbar-light mb-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {media.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--shop-border)] p-1.5"
                >
                  {row.url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- product-hosted image, not a local asset next/image can optimize
                    <img
                      src={row.url}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 shrink-0 rounded-md bg-[var(--shop-bg-soft)]" />
                  )}

                  <input
                    value={row.url}
                    onChange={(e) =>
                      handleMediaFieldChange(row.key, "url", e.target.value)
                    }
                    onBlur={() => handleSaveMedia(row)}
                    placeholder="https://…"
                    disabled={isPending}
                    className={`${smallInputClass} min-w-0 flex-1`}
                  />

                  <input
                    value={row.altText}
                    onChange={(e) =>
                      handleMediaFieldChange(row.key, "altText", e.target.value)
                    }
                    onBlur={() => handleSaveMedia(row)}
                    placeholder="Alt text"
                    disabled={isPending}
                    className={`${smallInputClass} w-24 shrink-0`}
                  />

                  <Dropdown
                    value={row.type}
                    options={MEDIA_TYPE_OPTIONS}
                    onChange={(v) => handleMediaTypeChange(row, v as MediaType)}
                    disabled={isPending}
                    size="sm"
                    className="w-24 shrink-0"
                    aria-label="Media type"
                  />

                  <button
                    type="button"
                    onClick={() => handleSetPrimary(row)}
                    disabled={isPending || row.isPrimary}
                    aria-label={
                      row.isPrimary ? "Primary image" : "Set as primary"
                    }
                    title={row.isPrimary ? "Primary image" : "Set as primary"}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md disabled:cursor-not-allowed ${
                      row.isPrimary
                        ? "text-[var(--shop-accent)]"
                        : "text-[var(--shop-text-muted)] hover:bg-[var(--shop-bg)] hover:text-[var(--shop-text)]"
                    }`}
                  >
                    <StarIcon
                      className="h-3.5 w-3.5"
                      fill={row.isPrimary ? "currentColor" : "none"}
                    />
                  </button>

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                    {savingMediaKey === row.key ? (
                      <span
                        aria-label="Saving"
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--shop-border)] border-t-[var(--shop-accent)]"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(row)}
                        disabled={isEdit && isRemovingMedia}
                        aria-label="Remove media"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-danger-bg)] hover:text-[var(--shop-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddMedia}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--shop-border)] px-3 py-2 text-[11px] font-bold text-[var(--shop-text-muted)] hover:border-[var(--shop-accent)] hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlusIcon className="h-3 w-3" strokeWidth={2.5} />
            Add media
          </button>
        </div>
      </form>
    </Modal>
  );
}
