# Shop Landing Page — Planning Handoff

**Status:** Planning complete, no code written yet. Ready to scaffold on request.
**Owner:** Bryan — frontend, UI/UX for the store landing page.
**Last updated:** 2026-07-24

---

## Context: what this repo actually is

`all-in-one-v2` is currently an **admin/backoffice-only** Next.js app (branded "Admin Central" in `layout.tsx` metadata). Evidence:

- Root `src/app/page.tsx` = admin **login** page, `src/app/register/page.tsx` = admin register
- `src/app/(admin)/` is a **route group** (parentheses = no URL segment added), so `(admin)/dashboard/page.tsx` serves at bare `/dashboard`, `(admin)/products/page.tsx` at bare `/products`, etc.
- No `middleware.ts` — route protection is client-side only, via `useAuthStore` + hardcoded `router.push("/")` redirects in `AdminLayout.tsx` (logout) and `AuthListener.tsx` (401 handler)
- Every existing feature (`auth`, `dashboard`, `users`, `posts`) is internal/authenticated tooling. Nothing customer-facing exists yet.

## Decisions made this session

1. **Same repo, not a separate app.** Considered splitting the storefront into its own Next.js app (cleaner SSG/ISR story, no route collisions) but Bryan chose to build it inside `all-in-one-v2` instead. Tradeoffs of that choice are in the conversation history if revisited later.
2. **New subpath, not the domain root.** Admin currently owns bare paths (`/`, `/dashboard`, `/products`, ...) with no `/admin` prefix. Two options were weighed:
   - **A (rejected):** Migrate all admin routes under `/admin/*`, freeing `/` for the landing page. Structurally cleaner for SEO but a real migration — touches `AdminLayout`, `AuthListener`, `LoginForm`/`useLogin` redirect targets, and root metadata.
   - **B (chosen):** Leave admin exactly where it is. Storefront lives under **`/shop`**. Zero changes to existing admin code.
3. **Known SEO cost of choice B:** `sitemap.ts` currently marks the bare domain root as priority 1, but root is the login page — anyone hitting `domain.com` directly still sees a login form, not the store. This needs fixing regardless (see SEO fixes below), but it's an accepted tradeoff, not a blocker.

## The plan

### Routing

```
src/app/shop/
  layout.tsx       # optional — storefront-specific <title>/OG metadata override
  page.tsx          # landing page, dumb composer only (renders feature component)
```

Nothing in `src/app/(admin)/`, `src/app/page.tsx`, or `src/app/register/` changes.

### Feature folder (FAOS convention, same pattern as `src/features/posts/`)

```
src/features/storefront/
  contracts/storefront.contract.ts   # Zod schemas — hero content, featured products, promos
  api/storefront.client.ts           # fetch + Schema.parse()
  api/storefront.keys.ts             # query key factory
  hooks/useFeaturedProducts.ts       # useSafeQuery wrapper — only for genuinely dynamic sections
  components/
    LandingPage.tsx                  # top-level layout, composed in app/shop/page.tsx
    Hero.tsx
    FeaturedProducts.tsx
    ...
  feature.manifest.ts                # name: "storefront", dependsOn: [], exposes: [...]
```

### SEO config fixes (small, needed given SEO is a stated priority)

- `src/app/sitemap.ts` — change the priority-1 entry from bare `baseUrl` to `${baseUrl}/shop`
- `src/app/robots.ts` — currently only disallows `/dashboard/` and `/api/`. Expand to cover **all** admin routes: `/products/`, `/orders/`, `/customers/`, `/suppliers/`, `/reports/`, `/settings/`, `/tools/`, `/marketing/`, `/activity-logs/`, `/integrations/`

### Deferred decisions (not yet made — revisit when relevant)

- Rendering strategy for the landing page: Server Component + direct data fetch (best for SEO, skip `useSafeQuery` client hook) vs. client-side fetching — depends on whether early content is static or needs real dynamic data
- Whether `/shop` gets its own `layout.tsx` with distinct theming, or inherits the root layout's fonts (Poppins/Geist) as-is
- Whether the storefront backend API is the same API as admin, or separate — unconfirmed, doesn't block starting frontend work (can stub with Zod contracts same as rest of the app)

## Applicable rules from `docs/Framework-Structure/` (recap for Bryan's role)

- `app/` pages are dumb composers only — no logic, no raw fetches (`engineering-handbook.md` §2)
- Every API response is Zod-validated at the `*.client.ts` boundary (`engineering-handbook.md` §7)
- Use `useSafeQuery`/`useSafeMutation`, never raw React Query hooks, for any dynamic data (`engineering-handbook.md` §8.4)
- Absolute imports only (`@/features/...`, `@/shared/...`), never cross-feature imports, enforced by `pnpm validate`
- Every new feature needs a `feature.manifest.ts` (CI-only, never imported into the React tree)
- `pnpm storybook` is the recommended place to build/iterate on landing-page components in isolation before wiring real data
- Full pre-commit gate: `pnpm lint && pnpm type-check && pnpm validate && pnpm test`

## Next step

Scaffold `src/app/shop/` + `src/features/storefront/` per the plan above, plus the two `sitemap.ts`/`robots.ts` edits. Nothing has been created yet — this file is the resume point.
