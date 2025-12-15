# Web App Refactor Plan

## Goals

- Adopt a feature-first, domain-driven structure for the Next.js App Router.
- Simplify imports and colocation of feature code.
- Remove auth; app runs locally and stores state client-side.
- Prepare for a clean Next.js API migration later.

## Folder Structure

- `app/`
  - `layout.tsx`, `page.tsx`
  - `channels/` (`page.tsx`, `layout.tsx`)
  - `movies/` (`page.tsx`, `movie/page.tsx`, `layout.tsx`)
  - `series/` (`page.tsx`)
  - `playlists/add/page.tsx`
- `src/`
  - `features/`
    - `home/` (`components`, `hooks`)
    - `playlists/` (`components`, `hooks`, `services`)
    - `channels/` (`components`, `hooks`)
    - `movies/` (`components`, `hooks`)
    - `series/` (`components`, `hooks`)
    - `player/` (`components`, `hooks`)
  - `shared/`
    - `ui/` (button, select, sheet, slider, Controls, EmptyState, LoadingSpinner)
    - `components/` (generic cross-feature)
    - `hooks/` (useDebounce, useAutoScrollToSelected)
    - `lib/` (utils, type helpers)
    - `api/` (`trpc.ts`, `session.ts`)
    - `state/` (`playlist`, `player`, `watched`)
    - `types/` (Channel, Movie, Series, Playlist)
    - `providers/` (`TrpcProvider`, root `Providers`)
  - `config/` (env accessors, constants)
  - `styles/` (globals.css)
  - `tests/` (unit/integration)
- `public/` (assets)
- `src-tauri/` (unchanged)

## Cleanup & Migration Todos

- Set TS path aliases for `@/features/*` and `@/shared/*`.
- Rename `components/commen` to `src/shared/components/common`.
- Remove duplicate `components/HomeSearch.tsx`; keep `features/home/components/HomeSearch.tsx`.
- Move UI primitives from `components/ui/*` to `src/shared/ui/*`.
- Move domain components:
  - Channels → `src/features/channels/components/*`
  - Movies → `src/features/movies/components/*` (ItemsList, ItemsDetails, TMDB blocks)
  - Series → `src/features/series/components/*`
  - Player → `src/features/player/components/*` and `hooks/*`
- Move shared hooks to `src/shared/hooks/*`; keep feature-specific hooks under each feature.
- Split `lib/*`:
  - `utils.ts` → `src/shared/lib/utils.ts`
  - `trpc.ts` → `src/shared/api/trpc.ts`
- Move Zustand stores to `src/shared/state/*` (playlist, player, watched).
- Update imports to use aliases; remove deep relative paths.
- Keep `app/*` routes thin; import from `src/features/*`.
- Add basic tests for player and stores.

## Auth Removal

- Delete auth-specific providers and hooks (AuthProvider, auth-client).
- Remove `app/sign-in/page.tsx` route and all references.
- Ensure no guarded logic depends on server sessions; rely on local state only.

## Notes

- TRPC client remains, pointing to local or future Next.js API.
- Bulk ingestion/updates will move to Next.js API later; UI remains unchanged.
