"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "@/shared/components/Dropdown";
import { Modal } from "@/shared/components/Modal";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategories,
} from "../hooks/useCategories";
import type { Category } from "../contracts/categories.contract";
import type { CategoryWriteInput } from "../api/categories.client";

const NO_PARENT = "";

const inputClass =
  "w-full rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-2 text-xs text-[var(--shop-text)] outline-none focus:border-[var(--shop-accent)]";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

/** "Women's Shoes" -> "womens-shoes" */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CategoryFormModalProps = {
  /** Present = edit mode (seeded from this row). Absent = create mode. */
  category?: Category;
  // Create-mode only — pre-selects the parent, used by the "Add
  // subcategory" entry point on a category's detail page.
  defaultParentId?: string;
  onClose: () => void;
};

export function CategoryFormModal({
  category,
  defaultParentId,
  onClose,
}: CategoryFormModalProps) {
  const isEdit = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [parentId, setParentId] = useState(
    category?.parentId ?? defaultParentId ?? NO_PARENT,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Candidate parents: root categories + their one level of children (the
  // only depth this admin UI otherwise shows) — a flat picker rather than a
  // nested one, since the tree is never more than 2 levels deep in practice.
  // Excludes itself and its own children so you can't parent a category to
  // itself or create an immediate cycle.
  const { data: categoriesPage } = useCategories({ limit: 100 });
  const ownChildIds = new Set((category?.children ?? []).map((c) => c.id));
  const parentOptions = [
    { value: NO_PARENT, label: "No parent (top-level)" },
    ...(categoriesPage?.items ?? [])
      .flatMap((root) => [root, ...root.children])
      .filter((c) => c.id !== category?.id && !ownChildIds.has(c.id))
      .map((c) => ({
        value: c.id,
        label: c.parentId ? `${c.name} (subcategory)` : c.name,
      })),
  ];

  // Keep the form synced if the underlying row refetches mid-edit.
  useEffect(() => {
    if (!category) return;
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description ?? "");
    setParentId(category.parentId ?? NO_PARENT);
  }, [category]);

  const onValidationError = (fields: Record<string, string[]>) => {
    const mapped: Record<string, string> = {};
    Object.entries(fields).forEach(([k, v]) => {
      mapped[k] = v[0] ?? "Invalid";
    });
    setErrors(mapped);
  };

  const { mutate: create, isPending: isCreating } = useCreateCategory({
    onValidationError,
  });
  const { mutate: update, isPending: isUpdating } = useUpdateCategory(
    category?.id ?? "",
    { onValidationError },
  );
  const { mutate: remove, isPending: isDeleting } = useDeleteCategory();

  const isPending = isCreating || isUpdating || isDeleting;

  const dirty =
    !isEdit ||
    name !== category!.name ||
    slug !== category!.slug ||
    description !== (category!.description ?? "") ||
    parentId !== (category!.parentId ?? NO_PARENT);

  const buildInput = (): CategoryWriteInput => ({
    name,
    // Categories have no server-side slugify fallback (unlike products), so
    // an empty field is always backfilled from the name client-side rather
    // than left blank.
    slug: slug.trim() || slugify(name),
    description: description.trim() || null,
    parentId: parentId === NO_PARENT ? null : parentId,
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
    if (!category) return;
    remove(category.id, { onSuccess: onClose });
  };

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Edit category" : "New category"}
      subtitle={isEdit ? category?.name : undefined}
      maxWidthClassName="max-w-[480px]"
      footer={
        confirmingDelete ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--shop-danger)]/30 bg-[var(--shop-danger-bg)] p-4">
            <p className="flex-1 text-[13px] font-semibold text-[var(--shop-danger)]">
              Delete &quot;{category?.name}&quot;? This can&apos;t be undone.
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
                Delete category
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
              form="category-form"
              disabled={isPending || !dirty || !name.trim()}
              className="rounded-lg bg-[var(--shop-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--shop-bg)] hover:bg-[var(--shop-ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isCreating || isUpdating
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create category"}
            </button>
          </div>
        )
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4"
      >
        <div>
          <label className={labelClass}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            disabled={isPending}
            className={inputClass}
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-[var(--shop-danger)]">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={name ? slugify(name) : "auto-generated from name"}
            disabled={isPending}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Parent category</label>
          <Dropdown
            value={parentId}
            options={parentOptions}
            onChange={setParentId}
            disabled={isPending}
            aria-label="Parent category"
          />
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
      </form>
    </Modal>
  );
}
