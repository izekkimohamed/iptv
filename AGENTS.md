# StreamMax IPTV Monorepo

## Overview

StreamMax is an IPTV streaming application supporting live TV, movies, series, and live sports scores. Built as a Turborepo monorepo targeting three platforms: web (Next.js), mobile (Expo/React Native), and desktop (Tauri wrapping the web app).

## Tech Stack

- **Package manager**: Bun 1.3.9
- **Monorepo**: Turborepo v2.5.6
- **Web**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui
- **Mobile**: Expo SDK 54, React Native 0.81, expo-router v6
- **Desktop**: Tauri v2 (wraps the web app)
- **API**: Next.js 16 (App Router), tRPC 11, Drizzle ORM, PostgreSQL
- **State**: Zustand v5, React Query (via tRPC)
- **Video**: hls.js (web), expo-video (mobile)

## Project Structure

```
apps/web/         # Next.js web + Tauri desktop
apps/mobile/      # Expo/React Native mobile app
apps/api/         # Next.js API backend (port 3001)
packages/hooks/   # Shared React hooks
packages/store/   # Shared Zustand stores
packages/trpc/    # tRPC routers, DB schema, services
packages/utils/   # Shared utilities
```

## Commands

```bash
# Development
bun run dev              # Start all apps (uses dotenv + turbo)
bun run dev --filter=web # Start web only
bun run dev --filter=api # Start API only

# Build & Lint
bun run build            # Build all packages
bun run lint             # Lint all packages
bun run check-types      # TypeScript type checking

# Mobile
bun run android          # Run Android
bun run ios              # Run iOS

# API tests (from apps/api/)
bun run test             # Run Vitest
```

## Conventions

### File Naming

- **Components**: PascalCase (`VideoPlayer.tsx`, `ChannelRow.tsx`)
- **Hooks**: camelCase with `use` prefix (`usePlayer.ts`, `usePlaylistForm.ts`)
- **Utilities**: camelCase (`cleanName.ts`, `formatDate.ts`)
- **Stores**: camelCase (`player-store.ts`, `watchedStore.ts`)
- **API routes**: camelCase (`channels.ts`, `playlists.ts`)
- **Mobile screens**: camelCase (`channels.tsx`, `manage.tsx`)

### Import Patterns

```typescript
// Web: @/ maps to ./src/
import { Button } from "@/shared/components/ui/button";
import { VideoPlayer } from "@/features/player/components/VideoPlayer";

// Mobile: @/ maps to app root
import { Header } from "@/components/Header";
import { usePlayer } from "@/hooks/usePlayer";

// API: @/ maps to api root
import { db } from "@/lib/trpc";

// Workspace packages (all apps)
import { usePlaylistStore } from "@repo/store";
import { cleanName } from "@repo/utils";
import { usePlaylistForm } from "@repo/hooks";
```

### Web Architecture (apps/web)

- **App Router**: Pages use server/client split pattern:
  - `page.tsx` — server component (metadata exports only)
  - `page-client.tsx` — `'use client'` component with all logic
- **UI**: shadcn/ui (new-york style) + Tailwind CSS v4 + Radix UI + Lucide icons
- **Feature modules**: `src/features/<feature>/components/`, `src/features/<feature>/hooks/`
- **Shared components**: `src/shared/components/ui/` (primitives), `src/shared/components/common/` (reusable)
- **Static export**: `output: 'export'` in next.config.ts for Tauri compatibility

### Mobile Architecture (apps/mobile)

- **Routing**: expo-router file-based with `(tabs)` group, dynamic `[id]` routes
- **UI**: React Native `StyleSheet.create` (NOT NativeWind classes in practice)
- **Icons**: `lucide-react-native`
- **Lists**: `@shopify/flash-list` for all scrollable lists
- **Animations**: `react-native-reanimated` v4, `react-native-gesture-handler`
- **Video**: `expo-video` for playback
- **State**: Local Zustand stores with `AsyncStorage` persistence (NOT shared `@repo/store` for most mobile-specific state)

### API Architecture (apps/api)

- **tRPC**: All procedures defined in `lib/routes/`, combined in `lib/router.ts`
- **Database**: Drizzle ORM with PostgreSQL, schema in `packages/trpc/src/server/schema.ts`
- **Services**: Business logic in `services/` directory
- **Input validation**: Zod schemas on all procedures
- **CORS**: Custom headers on all API routes

### Styling

- **Web**: Tailwind CSS v4 with CSS variables, `cn()` helper from `clsx` + `tailwind-merge`
- **Mobile**: `StyleSheet.create` with theme constants from `@/theme/playerTheme`
- **Dark-first**: Both platforms default to dark theme

### State Management

- **Shared** (`@repo/store`): playlist management, player state, watch progress
- **Mobile-specific**: local Zustand stores for mobile-only state (search history, theme, favorites)
- **Server state**: React Query via tRPC for all API data

## Key Integrations

- **Xtream IPTV**: `@iptv/xtream-api` for IPTV protocol (channels, movies, series)
- **TMDB**: Movie/show metadata enrichment (poster, description, ratings)
- **365scores**: Live sports match data (proxied through API)
- **Tauri**: Desktop wrapper with Rust commands for sync and native features

## Important Notes

- All packages use workspace references: `"@repo/*": "workspace:*"`
- API runs on port 3001, web on port 3000
- Environment variables use `dotenv-cli` wrapper
- The `.env` file is required for `DATABASE_URL` and API keys
- Do NOT modify `.vercel/` directory — it's managed by Vercel CLI
