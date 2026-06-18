<div align="center">
  <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" alt="Next.js Logo" width="120" height="120" />
  <h1>Next.js Tailwind Master Template</h1>
  <p>A highly-opinionated, production-ready template for building scalable web applications.</p>
  
  <div>
    <img src="https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/ESLint-8.x-4B32C3?style=flat-square&logo=eslint" alt="ESLint" />
    <img src="https://img.shields.io/badge/Prettier-3.5-F7B93E?style=flat-square&logo=prettier" alt="Prettier" />
  </div>
</div>

<hr />

## 🎯 Why this template?

Most Next.js projects start unstructured and grow into technical debt.
This template enforces:
- scalable folder structure
- consistent state management
- standardized API layer
- predictable UI composition

## ✨ Features

- **Framework**: [Next.js](https://nextjs.org/) (App Router enabled)
- **UI & Styling**: [Tailwind CSS v3](https://tailwindcss.com/) for utility-first styling, [clsx](https://github.com/lukeed/clsx) & [tailwind-merge](https://github.com/dcastil/tailwind-merge) for dynamic class handling.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for lightweight, fast, and scalable global state.
- **Data Fetching**: Pure [React Query (v5)](https://tanstack.com/query/latest) paired with native `fetch` for robust API communication without unnecessary abstraction layers.
- **Error Handling**: Built-in global API error toasts via [Sonner](https://sonner.emilkowal.ski/) tied directly into React Query cache boundaries.
- **Auth Architecture**: API-agnostic Auth Client Adapter for token and session state management.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid, declarative animations.
- **Data Visualization**: [Recharts](https://recharts.org/) for beautiful, responsive charts.
- **Icons**: [Lucide React](https://lucide.dev/) for crisp, consistent SVG icons.
- **Developer Experience**: Fully configured with TypeScript, strict Feature-Isolation ESLint boundaries (`eslint.config.mjs`), and Prettier.
- **Runtime Safety**: [Zod](https://zod.dev/) for API contract validation at the feature boundary — backend drift throws immediately.
- **RBAC**: Role-based access control via pure engine in `shared/auth/` consumed via `usePermissions()` and `<Can>` component.

## 🧠 Architecture

This project follows a Pure TanStack architecture:

- **Next.js** → routing + rendering
- **TanStack Query** → server state management (`useSafeQuery` / `useSafeMutation`)
- **Native fetch** → HTTP layer (`shared/lib/http.ts`)
- **Zustand** → UI state only
- **Zod** → API contract enforcement at feature boundary
- **Feature-based architecture is enforced across the entire codebase with strict import boundaries.**

### 🌍 Environment Assumption

This frontend assumes:
- External API backend
- JWT or token-based auth (optional)
- REST or GraphQL compatible endpoints

### 🧠 Data Layer Rules

**Data Flow**:
UI Component  
→ React Query Hook  
→ Feature API Service (`*.client.ts`)
→ Shared Fetcher (`http.ts`)
→ Backend API  
→ Response cached in React Query

**State Rules**:
- **Server State**: React Query is the single source of truth for server state caching and synchronization.
- **UI State**: Zustand is strictly for UI state only.

**API Rules**:
- 🔐 **Data Fetching**: All API communication must go through `features/*/api/*.client.ts` or `shared/lib/http`. No direct fetch calls in components.
- **API Contract Assumption**: All API responses are external contracts and must be treated as unstable unless typed explicitly in each feature.

**Error Handling Rules**:
- **Error Model**: All API errors are normalized by `http.ts` into a typed `ApiError` with an `ErrorCategory`. Routed globally via `error-router.ts`. Components never inspect raw status codes.
- **Error Pipeline**: `http.ts → ApiError → error-router → [toast | logout | form | retry]`
- **Retry Policy**: React Query retries are policy-driven via `shared/errors/retry-policy.ts`, not hardcoded.
- **Form Errors**: `VALIDATION` (422) errors bypass the global toast and are mapped to form fields via `mapApiValidationToForm`.

### 🚧 Architecture Boundaries

- **Feature Isolation**: Feature-to-feature imports are forbidden. Only `app/` can compose multiple features. **Enforced via ESLint + `npm run validate` (AST scanner).**
- **Shared Kernel Constraint**: `shared/` must never import from `features/` or `app/`. It is strictly deterministic infrastructure.
- **App Layer Constraint**: `app/` cannot import `@tanstack/react-query` directly. It must consume hooks from `features/`.
- **Import Strategy**: Use absolute imports only (`@/app`, `@/features`, `@/shared`). Relative imports beyond 1 level are forbidden.
- **Types / Contracts**: Each feature owns its own `contracts/` (Zod schemas) and `types.ts`. Shared types are only for cross-domain primitives.

### 🧩 System Primitives (FAOS)

Our architecture provides deterministic, non-runtime system primitives:
- **RBAC**: `shared/auth/rbac.ts` (pure engine) + `usePermissions()` + `<Can permission="...">` component.
- **Feature Flags**: `shared/flags/` with a swappable `FlagEngine` adapter (`useFeatureFlag()`).
- **Pagination**: URL-safe `usePagination()` bound to `useSearchParams` — page state lives in the URL, never in Zustand.
- **Error Kernel**: `shared/errors/` — `ApiError` → `error-router` → `retry-policy` → `map-validation` → `use-error-telemetry`.
- **Query Wrappers**: `useSafeQuery` / `useSafeMutation` in `shared/query/` — apply retry policy and error routing automatically.
- **Zod Contracts**: Each feature's `contracts/` folder holds Zod schemas. API responses are parsed at the `*.client.ts` boundary.
- **Feature Manifests**: `feature.manifest.ts` per feature — CI-only static declarations of dependencies and public surface.
- **Architecture Validator**: `npm run validate` — AST scanner that blocks builds on any boundary violation.

### 🧱 Design Philosophy

This template prioritizes:
- **Predictability** over abstraction.
- **Composition** over complexity.
- **Native Web APIs** over third-party wrappers.

## 🧪 Tech Decisions

- **Zustand over Redux** → Less boilerplate, faster onboarding, excellent performance.
- **Pure React Query** → Server-state separation and smart caching out of the box without the need for an external API wrapper like Axios or Apisauce.
- **Native Fetch** → Embracing modern web standards. No extra HTTP dependencies.
- **Framer Motion** → Declarative, easy-to-read animations.

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v20+ recommended) and a package manager installed.

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <your-repo-url>
   cd next-tailwind-template
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### 🔐 Environment Variables

Create a `.env.local` file at the root of the project to add required environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app running.

## 📂 Project Structure

```text
src/
├── app/                     # Next.js routes (thin composer layer only)
├── features/                # Domain logic — each feature is self-contained
│   ├── auth/
│   │   ├── api/             # login.api.ts
│   │   ├── components/      # Can.tsx (RBAC gate)
│   │   ├── hooks/           # usePermissions.ts
│   │   ├── stores/          # auth.store.ts
│   │   └── feature.manifest.ts  # CI-only dependency declaration
│   └── users/
│       ├── api/             # users.client.ts, users.keys.ts
│       ├── contracts/       # users.contract.ts (Zod schema)
│       ├── hooks/           # useUsers.ts
│       └── feature.manifest.ts
└── shared/                  # Pure infrastructure — no business logic
    ├── auth/                # RBAC engine (roles, permissions, rbac)
    ├── errors/              # ApiError, error-router, retry-policy, map-validation
    ├── flags/               # FlagEngine, useFeatureFlag
    ├── lib/                 # http.ts, query-provider.tsx
    ├── pagination/          # usePagination (URL-safe), PaginatedResponse<T>
    └── query/               # useSafeQuery, useSafeMutation
tools/
└── validate-architecture.mjs  # AST boundary enforcer (CI-only)
package.json
eslint.config.mjs            # Flat-config boundary rules
tsconfig.json
```

## 🛠️ Scripts

- `npm run dev` / `pnpm dev`: Starts the local development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: ESLint — checks feature isolation, shared purity, and app layer rules.
- `npm run type-check`: TypeScript compiler check (no emit).
- `npm run validate`: **FAOS Architecture Validator** — AST scan for boundary violations, manifest graph check. Run in CI before build.
- `npm run format`: Formats code using Prettier.
- `npm run clean`: Cleans the `.next` and `out` build directories.

## 🌐 Deployment

This project is configured for easy deployment on **Vercel**, the platform created by the makers of Next.js. Simply push your code to GitHub and connect the repository in your Vercel dashboard.

---

<div align="center">
  <i>Built with ❤️ using Next.js & Tailwind CSS</i>
</div>
