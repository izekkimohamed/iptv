# IPTV Web App - Improvements Plan

---

## ✅ 1. Bundle Size & Dependencies (Completed Feb 2026)

Removed 12 unused packages:

- `@better-fetch/fetch`, `@ffmpeg-installer/ffmpeg`, `fluent-ffmpeg`, `dotenv`, `install`, `media-icons`, `mp4box`, `node-fetch`, `react-virtualized-auto-sizer`, `react-window`
- DevDeps: `@types/fluent-ffmpeg`

---

## ✅ 2. Console Statements (Completed Feb 2026)

Removed 7 console.log/console.error/console.warn statements from:

- CustomControls.tsx (2 statements)
- VideoPlayer.tsx (4 statements)
- ErrorBoundary.tsx (1 statement)

---

## ✅ 3. useHls Hook Dependency Issue (Completed Feb 2026)

Fixed by using a ref for the onError callback to prevent unnecessary re-renders.

---

## ✅ 4. React.memo on Components (Completed Feb 2026)

Added React.memo to:

- EpisodeCard component
- MatchCard component

---

## ✅ 5. Missing useMemo (Completed Feb 2026)

Added useMemo for filtered lists in Landing.tsx:

- `filteredMovies` - memoized movies filtered by playlist
- `filteredSeries` - memoized series filtered by playlist

---

## ✅ 6. Hardcoded Values (Completed Feb 2026)

Extracted magic numbers to constants in `/src/constants/player.ts`:

- `FEEDBACK_DURATION` (600ms)
- `VLC_CHECK_INTERVAL` (1000ms)
- `VLC_STUCK_LOADING_THRESHOLD` (15000ms)
- `WATCHED_THRESHOLD` (95%)
- `GOAL_POPUP_DURATION` (8000ms)

Applied to:

- VideoPlayer.tsx
- EpisodeCard.tsx
- MatchCard.tsx

---

## Summary

| Priority | Improvement                        | Status    |
| -------- | ---------------------------------- | --------- |
| ✅ Done  | Remove unused dependencies         | Completed |
| ✅ Done  | Remove console statements          | Completed |
| ✅ Done  | Fix useHls dependency issue        | Completed |
| ✅ Done  | Add React.memo to components       | Completed |
| ✅ Done  | Add useMemo for filtered lists     | Completed |
| ✅ Done  | Extract magic numbers to constants | Completed |
