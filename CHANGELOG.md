# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Storybook 8 with `@storybook/nextjs` adapter
- Playwright E2E test suite (`e2e/`)

---

## [1.1.0] - 2026-06-19

### Added

- **Environment Validation** (`src/shared/lib/env.ts`) — Zod-validated env schema that throws at startup if required variables are missing or malformed. Eliminates silent runtime failures from misconfigured environments.
- **`.env.example`** — Documented template for all required environment variables with descriptions.
- **VSCode Workspace Config** (`.vscode/settings.json`, `.vscode/extensions.json`) — Format on save, ESLint fix on save, Tailwind IntelliSense, and curated extension recommendations for every developer.
- **Git Hooks** — Husky pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files). Commit-msg hook enforces Conventional Commits via `commitlint`.
- **`commitlint.config.mjs`** — Conventional commit enforcement (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, etc.).
- **`lint-staged.config.mjs`** — Staged file linting: ESLint + Prettier for `.ts/.tsx`, Prettier for all other types.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — Full pipeline: install → type-check → lint → FAOS validate → test → build on every PR and push to `main`.
- **GitHub Actions Preview Deploy** (`.github/workflows/preview.yml`) — Optional Vercel preview deploy with PR comment on every pull request.
- **Vitest + React Testing Library** — Full testing setup with jsdom, v8 coverage, path aliases, and 60% coverage thresholds.
  - `src/shared/lib/__tests__/http.test.ts` — 9 unit tests for all HTTP error categories.
  - `src/shared/errors/__tests__/retry-policy.test.ts` — 8 tests verifying correct retry counts per error category.
  - `src/features/users/__tests__/useUsers.test.ts` — Hook integration tests with QueryClient wrapper.
  - `src/features/users/components/__tests__/UserListSkeleton.test.tsx` — Component render tests.
- **`dashboard` Feature** — Reference implementation for read-only data display with Recharts.
  - `StatsCard` — Animated metric card with trend indicator (up/down/neutral).
  - `RevenueChart` — `AreaChart` with gradient fills, currency axis, and dark-mode tooltip.
  - `useDashboardStats` — `useSafeQuery` hook with 5-minute stale time.
  - Mock data ready to swap for a real API endpoint.
- **`posts` Feature** — Full CRUD reference implementation demonstrating the complete mutation flow.
  - `PostList` — Animated list with `AnimatePresence` exit transitions, published/draft badges.
  - `CreatePostForm` — Mutation form with `onValidationError` binding, loading state, and reset on success.
  - `DeletePostButton` — Minimal mutation component with pulse animation during pending state.
  - `usePosts`, `useCreatePost`, `useDeletePost` — All using FAOS wrappers with automatic cache invalidation.
- **`CHANGELOG.md`** — This file.

### Changed

- `src/shared/lib/http.ts` — Now imports `NEXT_PUBLIC_API_URL` from the validated `env` module instead of reading `process.env` directly.
- `eslint.config.mjs` — Added cross-feature boundary isolation rules for new `posts` and `dashboard` features.

---

## [1.0.0] - 2026-06-18

### Added

- **FAOS v5 Architecture** — Feature-Oriented Architecture System with strict 3-layer separation (`app/`, `features/`, `shared/`).
- **Next.js 15** with App Router, TypeScript 5, Tailwind CSS v3.
- **TanStack React Query v5** with `useSafeQuery` and `useSafeMutation` wrappers.
- **Zustand v5** for UI state management.
- **Zod v4** for runtime API contract validation.
- **Error Kernel** — `ApiError`, `error-router`, `retry-policy`, `map-validation`, telemetry hook.
- **RBAC** — `shared/auth/rbac.ts` pure engine + `usePermissions()` + `<Can>` component.
- **Feature Flags** — `shared/flags/` with swappable `FlagEngine` adapter.
- **URL-safe Pagination** — `usePagination()` binding page state to `useSearchParams`.
- **Architecture Validator** — `tools/validate-architecture.mjs` static import-boundary scanner enforcing all boundary rules.
- **Feature Manifests** — `feature.manifest.ts` per feature for CI-only dependency declarations.
- **`auth` feature** — API-agnostic auth client adapter with `useAuthStore` and `AuthListener`.
- **`users` feature** — Reference read feature with Zod contract, query key factory, and `useUsers` hook.
- **Landing page** — Full dark-mode landing page with Framer Motion animations.
- **SEO** — OpenGraph, Twitter card metadata, `robots.ts`, `sitemap.ts`.
- **Framer Motion v12**, **Recharts v3**, **Lucide React**, **Sonner**, **date-fns**, **next-themes**.
- ESLint flat config with FAOS boundary enforcement.
- Prettier, `rimraf`, TypeScript strict mode.

[Unreleased]: https://github.com/your-org/next-tailwind-template/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/your-org/next-tailwind-template/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/your-org/next-tailwind-template/releases/tag/v1.0.0
