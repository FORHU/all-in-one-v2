"use client";

import { useEffect, useState } from "react";
import { X as XIcon } from "lucide-react";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategoryOptions,
} from "../hooks/useProducts";
import {
  ProductStatusSchema,
  ProductVisibilitySchema,
  type AdminProduct,
  type ProductStatus,
  type ProductVisibility,
} from "../contracts/products.contract";
import type { ProductWriteInput } from "../api/products.client";
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

const NO_CATEGORY = "";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep the form synced if the underlying row refetches mid-edit.
  useEffect(() => {
    if (!product) return;
    setTitle(product.title);
    setSlug(product.slug);
    setBrand(product.brand ?? "");
    setCategoryId(product.category?.id ?? NO_CATEGORY);
    setStatus(product.status);
    setVisibility(product.visibility);
    setPrice(product.price?.toString() ?? "");
    setSalePrice(product.salePrice?.toString() ?? "");
    setCompareAtPrice(product.compareAtPrice?.toString() ?? "");
    setThumbnailUrl(product.thumbnailUrl ?? "");
  }, [product]);

  const { data: categoryOptions } = useCategoryOptions();
  const categoryDropdownOptions: DropdownOption[] = [
    { value: NO_CATEGORY, label: "No category" },
    ...(categoryOptions ?? []).map((c) => ({ value: c.id, label: c.name })),
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
    status,
    visibility,
    price: parseOptionalNumber(price),
    salePrice: parseOptionalNumber(salePrice),
    compareAtPrice: parseOptionalNumber(compareAtPrice),
    thumbnailUrl: thumbnailUrl.trim() || null,
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
    if (!product) return;
    remove(product.id, { onSuccess: onClose });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shop-ink)]/50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[560px] overflow-auto rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--shop-border)] p-6">
          <p className="shop-display text-[17px] font-semibold text-[var(--shop-text)]">
            {isEdit ? "Edit product" : "New product"}
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
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://…"
              disabled={isPending}
              className={inputClass}
            />
          </div>

          {confirmingDelete ? (
            <div className="col-span-2 flex items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
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
            <div className="col-span-2 flex items-center gap-2.5 border-t border-[var(--shop-border)] pt-5">
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
          )}
        </form>
      </div>
    </div>
  );
}
