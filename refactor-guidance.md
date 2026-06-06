# Refactor Guide – IPTV Player Monorepo

## 1. Project Overview

The current “IPTV Player” monorepo is a production‑grade, multip‑platform application built with the following stack:

* **Web** – Next.js 16 (App Router), Tailwind 4, React 19, tRPC, HLS.js, Zustand, Framer‑Motion​
* **Mobile** – Expo 54, React‑Native 0.81, Expo‑Router, tRPC, Zustand​
* **Desktop** – Tauri 2 + the same web bundle (served in kiosk mode)​
* **API** – Next.js 16 (edge‑friendly) with tRPC 11, Drizzle ORM (PostgreSQL), Xtream‑Codes API wrappers​
* **Shared** – Monorepo via **pnpm workspaces** + **Turborepo** for task orchestration; Zustand stores, custom hooks, and utility libraries under `packages/*`​

The code is well‑factors: server/​client boundaries are clear, routing is file‑system based, and shared types exploit TypeScript’s static typing.

## 2. Technologies & Alternatives

| Layer | Current tech | Suggested replacements / new options | Rationale |
|-------|--------------|-------------------------------------|------------|
| **API** | Next.js (API routes) + tRPC `app/api/trpc.ts` | **Hono** (or Fastify) | *Hono* is a minimal, middleware‑friendly server with native exports; easier to hot‑reload, lighter than Next.js. Keeps tRPC integration intact.
| | | | 1️⃣ Simpler runtime for pure API service.
| | | | 2️⃣ More explicit control over middleware, rate‑limiting, CORS, etc.
| | | | 3️⃣ Compatible with Vercel Functions, Cloudflare Workers.
| | | | 4️⃣ Bundle size shrinks, faster dev start.
| | | | 5️⃣ Team past experience: Hono works well with TypeScript & Drizzle.
| **Web** | Next.js App Router | Keep Next.js or switch to **Astro** for static‑first sites, but Next.js offers solid SSR & ISR.
| **Mobile** | Expo + React‑Native | Keep Expo – it abstracts RN and eases EAS builds.
| **Desktop** | Tauri 2 | Keep Tauri – already mature and integrated.
| **State** | Zustand | Could consider **Redux** if you need deterministic time travel or large global state, but Zustand is lightweight.
| **Styling** | Tailwind CSS, Framer‑Motion | Keep Tailwind (unstable), consider **shadcn/ui** for component primitives.
| **Data** | Drizzle ORM | Consider **Prisma** if you need a more mature schema playground.
| | | | But Drizzle is fine; migration script syntax is straightforward.
| **Testing** | Vitest | Keep Vitest for unit testing; add E2E with Playwright.

## 3. Folder‑Structure Blueprint

Below is a clean, scalable tree that respects modern monorepo practices. The tree supports **Web**, **Mobile**, **Desktop**, **API**, and shared **Packages**.

```
iptv/                                 # Root – must contain pnpm‑lock and turborepo
├─ .turbo/                              # Turborepo cache
├─ pnpm-lock.yaml
├─ package.json
├─ turbo.json
├─ lerna.json (optional)
├─ .env.example
├─ .env            # production env file
│
├─ apps/
│   ├─ web/                         # Next.js web + Tauri
│   │   ├─ src/
│   │   │   ├─ app/                  # App router pages
│   │   │   ├─ components/           # UI components
│   │   │   ├─ hooks/                # Web‑only hooks
│   │   │   ├─ lib/        # tRPC client, shared utils
│   │   │   ├─ store/    # Zustand stores
│   │   │   ├─ src-tauri/  # Tauri Rust side (Cargo.toml, tauri.conf.json)
│   │   ├─ public/
│   │   ├─ styles/
│   │   ├─ tsconfig.json
│   │   ├─ next.config.js
│   │   ├─ tailwind.config.js
│   │   └─ package.json
│   │
│   ├─ mobile/                     # Expo native app
│   │   ├─ app/                     # Expo Router routes
│   │   ├─ components/
│   │   ├─ hooks/
│   │   ├─ lib/
│   │   ├─ store/
│   │   ├─ app.json
│   │   ├─ app.tsx (ignored)          # built by Expo
│   │   ├─ package.json
│   │   └─ tsconfig.json
│   │
│   ├─ api/                        # API service (Next.js or Hono)
│   │   ├─ src/
│   │   │   ├─ routes/              # tRPC routers
│   │   │   ├─ lib/
│   │   │   ├─ services/
│   │   │   ├─ utils/
│   │   ├─ .env
│   │   ├─ package.json
│   │   └─ tsconfig.json
│   │
│   └─ desktop/                     # optional: pure Tauri app
│       └─ Cargo.toml
│
├─ packages/
│   ├─ trpc/      # shared tRPC types & router definitions
│   │   ├─ src/
│   │   │   ├─ server/
│   │   │   ├─ client/
│   │   │   ├─ utils.ts
│   │   ├─ tsconfig.json
│   │   └─ package.json
│   │
│   ├─ hooks/       # React hooks used by all platforms
│   │   ├─ src/
│   │   ├─ package.json
│   │   └─ tsconfig.json
│   │
│   ├─ store/       # Zustand stores shared between web & mobile
│   │   ├─ src/
│   │   ├─ package.json
│   │   └─ tsconfig.json
│   │
│   ├─ utils/        # pure utilities (cleanName, routes, etc.)
│   │   ├─ src/
│   │   ├─ package.json
│   │   └─ tsconfig.json
│   │
│   └─ types/         # global TS types (if needed)
│
├─ tests/          # optional: shared unit / integration tests
└─ scripts/        # helper scripts (migration, lint, etc.)
```

> **Tip** – Use `pnpm -F <workspace>` to run scripts for a single package.

## 4. Step‑by‑Step Refactor Road‑Map

The refactor is split into focused *tasks*.  Each task tackles one subject and can be executed independently.  After completing a task, run the full test/build suite to ensure nothing is broken.

| # | Title | What it touches | Checklist | Dependencies |
|---|-------|-----------------|-----------|--------------|
| 1 | **Audit current state** | All code | - List every `var`, `let`, or `const`. <br> - Identify duplicated logic between web/mobile. <br> - Map out API routes and their corresponding tRPC procedures. | None |
| 2 | **Create new workspace skeleton** | `apps/*`, `packages/*` | - Run `pnpm create monorepo`. <br> - Copy initial `package.json`, `turbo.json`. <br> - Verify `pnpm install` resolves. | 1 |
| 3 | **Migrate API to Hono** | `apps/api` | - Add `hono@latest`. <br> - Upload existing `trpc` server and routers to the new Hono app.<br> - Replace Next.js API routes with Hono handlers. <br> - Add CORS, rate limiting middleware. | 1,2 |
| 4 | **Re‑implement tRPC context** | `apps/api/lib/trpc.ts` | - Ensure context builds from request (`Request` object). <br> - Replace `NextApiRequest` with Hono `Context`. <br> - Export router. | 3 |
| 5 | **Update web client to use new Hono base** | `apps/web/src/lib/trpc.ts` | - Change base URL to `http://localhost:3001/trpc` (or env var). <br> - Add Hono client interceptors if needed. | 3,4 |
| 6 | **Move shared hooks** | `packages/hooks` | - Extract content‑reuseable hooks from web & mobile. <br> - Publish as `@repo/hooks`. <br> - Run unit tests for each. | 2,5 |
| 7 | **Move shared stores** | `packages/store` | - Extract Zustand stores. <br> - Update provider setup in web & mobile. | 6 |
| 8 | **Update Tauri configuration** | `apps/web/src-tauri` | - Ensure the main‑entry points match new web bundle. <br> - Update `tauri.conf.json` to point to `dist/web`. | 5 |
| 9 | **Add TypeScript config inheritance** | `tsconfig.json` | - Create a workspace‑wide `tsconfig.base.json`. <br> - Each package/​app extends it. |
| 10 | **Add environment auto‑loading** | `.env`, `.env.development`, `.env.production` | - Use `dotenv-cli`. <br> - For Hono, use `@hono/dotenv`. | 3 |
| 11 | **Introduce lint & format** | `.prettierrc`, `eslint.config.js` | - Shared rules across workspaces. | 2 |
| 12 | **Create CI pipelines** | `.github/workflows/ci.yml` | - lint <br> - test <br> - build | 10 |
| 13 | **Duplicate feature‑migration plan** | Each feature (channels, movies, series, playlists) | - Map feature‑id in API <br> - Build corresponding UI pages | 5 |

### Detailed Example – Task 3 (API → Hono)

1. **Install Hono**:
   ```bash
   pnpm add hono@latest
   ```
2. **Create `src/index.ts`** in `apps/api`:
   ```ts
   import { Hono } from 'hono'
   import { cors } from 'hono/cors'
   import { trpcRouter } from '../packages/trpc/src/server/router'
   import { createTRPCContext } from '../packages/trpc/src/server/trpc'

   const app = new Hono()
   app.use(cors({ origin: '*' }))

   // tRPC endpoint
   app.post('/trpc', async (c) => {
     const ctx = createTRPCContext(c)
     return trpcRouter.createContext(ctx) // tx probably
   })

   export default app
   ```
3. **Update `pnpm run dev`** script in `apps/api/package.json`:
   ```json
   "dev": "hono dev src/index.ts"
   ```
4. **Verify** by running `pnpm dev --filter=api` and visiting `http://localhost:3001/trpc`.
5. **Replace** all Next.js API route files (`app/api/trpc/*`) with this single handler.

Complete tasks in order, run `pnpm test` at the end of each.  Keep the branches separate if you want to experiment.

## 5. Quality & Safety Nets

* **Automated tests** – Aim for **≥90 % coverage** on shared utilities, hooks, and types.
* **Static analysis** – Use `eslint` with `@typescript-eslint/no-explicit-any` and `NoUnusedLocals` TS rule.
* **TypeScript strict mode** – Enable `strict` and `noUnusedParameters`.
* **Lint‑staged** – Run `lint-staged` pre‑commit to auto‑format.
* **CI** – GitHub Actions that run `pnpm test`, `pnpm lint`, and `pnpm build` on every push.

## 6. Deliverables

1. **`refactor-guidance.md`** (this file) – step‑by‑step playbook.  Feel free to clone the repo and replace placeholders.
2. **`package.json`** files updated for pnpm workspaces.
3. **Folder tree** – provided above; can be checked with `tree -L 3` for confirmation.
4. **CI workflow** – sample: `/.github/workflows/ci.yml`.

## 7. Next Steps

1. Create a new branch – `refactor‑start`.
2. Follow the tasks in order, committing after each complete.
3. When you hit a blocker, create an issue and comment.
4. Merge when tests pass.

---

**Author:** OpenCode
**Date:** 2026‑05‑24
