"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { X as XIcon, Plus as PlusIcon, Check as CheckIcon } from "lucide-react";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategoryOptions,
  useProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from "../hooks/useProducts";
import { usePricingRules } from "../hooks/usePricingRules";
import {
  ProductStatusSchema,
  ProductVisibilitySchema,
  type AdminProduct,
  type AdminProductVariant,
  type ProductStatus,
  type ProductVisibility,
} from "../contracts/products.contract";
import {
  createProductVariant,
  type ProductWriteInput,
  type VariantWriteInput,
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

const NO_CATEGORY = "";
const NO_PRICING_RULE = "";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const smallInputClass =
  "w-full rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2 py-1.5 text-[11px] text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

/** Local editable mirror of a variant row — `id` is only set once persisted (edit mode). */
type VariantRow = {
  key: string;
  id?: string;
  title: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  color: string;
  size: string;
  stockAvailable?: number;
};

function toVariantRow(v: AdminProductVariant): VariantRow {
  return {
    key: v.id,
    id: v.id,
    title: v.title,
    sku: v.sku ?? "",
    price: v.price.toString(),
    compareAtPrice: v.compareAtPrice?.toString() ?? "",
    color: v.color ?? "",
    size: v.size ?? "",
    stockAvailable: v.stockAvailable,
  };
}

function blankVariantRow(): VariantRow {
  return {
    key: crypto.randomUUID(),
    title: "",
    sku: "",
    price: "",
    compareAtPrice: "",
    color: "",
    size: "",
  };
}

function toVariantWriteInput(row: VariantRow): VariantWriteInput {
  return {
    title: row.title.trim(),
    price: Number(row.price) || 0,
    compareAtPrice:
      row.compareAtPrice.trim() === "" ? null : Number(row.compareAtPrice),
    sku: row.sku.trim() || null,
    color: row.color.trim() || null,
    size: row.size.trim() || null,
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

  // Local mirror of variant rows — edit mode seeds this once from the fetched
  // list (below), then add/edit/remove update it directly from each
  // mutation's own response, same reasoning as CollectionFormModal's `items`:
  // re-deriving from a live-refetching query would risk clobbering an
  // in-progress edit mid-typing. Create mode starts empty; everything in it
  // is "pending" until the product itself is created.
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [variantsSeeded, setVariantsSeeded] = useState(false);
  const queryClient = useQueryClient();

  const { data: fetchedVariants } = useProductVariants(product?.id ?? "");
  useEffect(() => {
    if (isEdit && fetchedVariants && !variantsSeeded) {
      setVariants(fetchedVariants.map(toVariantRow));
      setVariantsSeeded(true);
    }
  }, [isEdit, fetchedVariants, variantsSeeded]);

  const { mutate: createVariant, isPending: isCreatingVariant } =
    useCreateProductVariant(product?.id ?? "");
  const { mutate: updateVariant, isPending: isUpdatingVariant } =
    useUpdateProductVariant(product?.id ?? "");
  const { mutate: removeVariant, isPending: isRemovingVariant } =
    useDeleteProductVariant(product?.id ?? "");

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, blankVariantRow()]);
  };

  const handleRemoveVariant = (row: VariantRow) => {
    if (isEdit && row.id) {
      removeVariant(row.id, {
        onSuccess: () =>
          setVariants((prev) => prev.filter((r) => r.key !== row.key)),
      });
      return;
    }
    setVariants((prev) => prev.filter((r) => r.key !== row.key));
  };

  const handleVariantFieldChange = (
    key: string,
    field: keyof Omit<VariantRow, "key" | "id" | "stockAvailable">,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  };

  /** Edit mode only — create mode's rows are all attached in bulk after the product itself is created. */
  const handleSaveVariant = (row: VariantRow) => {
    const input = toVariantWriteInput(row);
    if (row.id) {
      updateVariant(
        { variantId: row.id, input },
        {
          onSuccess: (updated) =>
            setVariants((prev) =>
              prev.map((r) => (r.key === row.key ? toVariantRow(updated) : r)),
            ),
        },
      );
      return;
    }
    createVariant(input, {
      onSuccess: (created) =>
        setVariants((prev) =>
          prev.map((r) => (r.key === row.key ? toVariantRow(created) : r)),
        ),
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (isEdit) {
      update(buildInput(), { onSuccess: onClose });
      return;
    }

    create(buildInput(), {
      onSuccess: async (created) => {
        const pending = variants.filter((r) => r.title.trim());
        if (pending.length === 0) {
          onClose();
          return;
        }
        try {
          await Promise.all(
            pending.map((r) =>
              createProductVariant(created.id, toVariantWriteInput(r)),
            ),
          );
          queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
        } catch {
          notify.error(
            "Product created, but some variants couldn't be attached. Open it again to retry.",
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
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://…"
              disabled={isPending}
              className={inputClass}
            />
          </div>

          <div className="col-span-2 border-t border-[var(--shop-border)] pt-5">
            <label className={labelClass}>Variants ({variants.length})</label>
            <p className="-mt-1 mb-3 text-[11px] text-[var(--shop-text-muted)]">
              {isEdit
                ? "Fill in a variant's details and press Save to add or update it — removing one is immediate."
                : "Variants added here are created once you create the product below."}
            </p>

            {variants.length === 0 ? (
              <p className="text-xs text-[var(--shop-text-muted)]">
                No variants yet.
              </p>
            ) : (
              <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
                {variants.map((row) => {
                  const canSave = row.title.trim() && row.price.trim() !== "";
                  const isSavingThisRow =
                    isCreatingVariant || isUpdatingVariant;
                  return (
                    <div
                      key={row.key}
                      className="rounded-lg border border-[var(--shop-border)] p-2.5"
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <input
                          value={row.title}
                          onChange={(e) =>
                            handleVariantFieldChange(
                              row.key,
                              "title",
                              e.target.value,
                            )
                          }
                          placeholder="Variant title (e.g. Red / M)"
                          disabled={isPending}
                          className={smallInputClass}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(row)}
                          disabled={isEdit && isRemovingVariant}
                          aria-label={`Remove ${row.title || "variant"}`}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--shop-text-muted)] hover:bg-[var(--shop-danger-bg)] hover:text-[var(--shop-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="mb-1.5 grid grid-cols-3 gap-1.5">
                        <input
                          value={row.sku}
                          onChange={(e) =>
                            handleVariantFieldChange(
                              row.key,
                              "sku",
                              e.target.value,
                            )
                          }
                          placeholder="SKU"
                          disabled={isPending}
                          className={smallInputClass}
                        />
                        <input
                          value={row.price}
                          onChange={(e) =>
                            handleVariantFieldChange(
                              row.key,
                              "price",
                              e.target.value,
                            )
                          }
                          placeholder="Price"
                          inputMode="decimal"
                          disabled={isPending}
                          className={smallInputClass}
                        />
                        <input
                          value={row.compareAtPrice}
                          onChange={(e) =>
                            handleVariantFieldChange(
                              row.key,
                              "compareAtPrice",
                              e.target.value,
                            )
                          }
                          placeholder="Compare-at"
                          inputMode="decimal"
                          disabled={isPending}
                          className={smallInputClass}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          value={row.color}
                          onChange={(e) =>
                            handleVariantFieldChange(
                              row.key,
                              "color",
                              e.target.value,
                            )
                          }
                          placeholder="Color"
                          disabled={isPending}
                          className={smallInputClass}
                        />
                        <input
                          value={row.size}
                          onChange={(e) =>
                            handleVariantFieldChange(
                              row.key,
                              "size",
                              e.target.value,
                            )
                          }
                          placeholder="Size"
                          disabled={isPending}
                          className={smallInputClass}
                        />
                      </div>

                      {isEdit && (
                        <div className="mt-2 flex items-center justify-between">
                          {row.stockAvailable !== undefined ? (
                            <Link
                              href="/inventory/stock"
                              className="text-[11px] text-[var(--shop-text-muted)] hover:text-[var(--shop-accent)] hover:underline"
                            >
                              {row.stockAvailable} in stock — manage →
                            </Link>
                          ) : (
                            <span />
                          )}
                          <button
                            type="button"
                            onClick={() => handleSaveVariant(row)}
                            disabled={isPending || !canSave}
                            className="flex items-center gap-1 rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-2.5 py-1 text-[11px] font-bold text-[var(--shop-text)] hover:bg-[var(--shop-bg)] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <CheckIcon className="h-3 w-3" />
                            {isSavingThisRow ? "Saving…" : "Save"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddVariant}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--shop-border)] px-3 py-2 text-[11px] font-bold text-[var(--shop-text-muted)] hover:border-[var(--shop-accent)] hover:text-[var(--shop-text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusIcon className="h-3 w-3" strokeWidth={2.5} />
              Add variant
            </button>
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
