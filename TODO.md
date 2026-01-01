# TODO

Here is a list of suggested refactoring and code sharing tasks to improve the project's structure and maintainability. For each task, there are instructions on how to proceed.

## Code Sharing

- [x] **Create a shared `store` package.**
- **Instructions:** Create a new package `packages/store`. Move the contents of `apps/web/store` into `packages/store/src`. Add `zustand` and other necessary dependencies to the new package's `package.json`. Update `apps/web` and `apps/mobile` to use this new package and remove their local `store` directories. Run `pnpm install` and fix any import errors.

- [x] **Create a shared `utils` package.**
  - **Instructions:** Create a new package `packages/utils`. Move the utility functions from `apps/web/lib/utils.ts` and `apps/mobile/lib/utils.ts` into the new package. The `cleanName` function is duplicated and should be one of the first to be moved. Other functions like `formatDate`, `formatRuntime`, etc., from the web `utils.ts` should also be moved. The `cn` function from web should remain in the web app as it's specific to `tailwind-merge`.

- [x] **Create a shared `usePlaylistForm` hook.**
  - **Instructions:** Create a new shared package, e.g., `packages/hooks`. Inside, create a `usePlaylistForm.ts` hook. This hook will contain the logic from `apps/web/components/PlaylistForm.tsx` and `apps/mobile/components/PlaylistForm.tsx`. This includes the `useState` for form data, the `trpc.playlists.createPlaylist.useMutation`, the `usePlaylistStore` interactions, and the URL validation logic. The hook should return the form state, handlers, and mutation status. The `web` and `mobile` `PlaylistForm` components will then be refactored to use this hook, simplifying them to be mostly presentational.

## Refactoring & Bug Fixes

- [x] **Fix bug in `channelService.ts`.**
  - **Instructions:** In `apps/api/services/channelService.ts`, the `toDelete` logic in the `fetchAndPrepareChannels` function is incorrect. It should be filtering the `existing` channels, not the `fetched` ones. The line should be changed from `fetched.filter(...)` to `existing.filter(c => !fetchedMap.has(c.streamId))`. After fixing, consider adding a test case for this service to prevent future regressions.

- [x] **Improve `cleanName` test names.**
  - **Instructions:** The test names in `apps/api/utils/cleanName.test.ts` can be more descriptive. For example, `it("should remove pipe-separated prefix")` instead of `it("should trim whitespace")` for the test case with the pipe character. Review all test names in the file and update them to accurately reflect what they are testing.

- [x] **Review API services for duplicated logic.**
  - **Instructions:** The services in `apps/api/services` (e.g., `channelService.ts`, `movieService.ts`, `seriesService.ts`) likely have similar logic for fetching, comparing, and inserting data. Review these files to identify common patterns. For example, the "fetch, compare, insert/delete" pattern could be abstracted into a generic function that takes the schema, fetch function, and playlist ID as arguments.

## Testing

- [ ] **Increase test coverage for API.**
  - **Instructions:** Continue adding tests for the `api` application. A good place to start would be the services in `apps/api/services`. For example, after fixing the bug in `channelService.ts`, add a test file `channelService.test.ts` to test the `fetchAndPrepareChannels` function with mock data.

- [ ] **Add tests for frontend applications.**
  - **Instructions:** Set up a testing environment for the `web` and `mobile` applications. For the `web` app, `vitest` can be used, similar to the `api` app. For the `mobile` app, `jest` is commonly used with React Native. Start by adding tests for simple components and hooks.

## Package Management

- [ ] **Analyze and remove unused packages.**
  - **Instructions:** The `depcheck` tool has identified a number of potentially unused packages in the monorepo. Review the list below and remove the packages that are not needed. Be careful not to remove packages that are used indirectly or are false positives.
  - **`apps/api`:** `@repo/trpc`, `@types/react`, `@types/react-dom`, `eslint-config-next`
  - **`apps/web`:** `@better-fetch/fetch`, `@ffmpeg-installer/ffmpeg`, `@repo/trpc`, `@types/hls.js`, `fluent-ffmpeg`, `hls.js`, `install`, `mp4box`, `node-fetch`, `react-virtualized-auto-sizer`, `react-window`, `superjson`, `video.js`, `videojs-contrib-quality-levels`, `videojs-hotkeys`, `videojs-http-source-selector`, `vlc.js`, `@tailwindcss/postcss`, `@tauri-apps/cli`, `@types/fluent-ffmpeg`, `@types/node`, `eslint-config-next`, `eslint-config-prettier`, `eslint-plugin-prettier`, `eslint-plugin-simple-import-sort`, `eslint-plugin-tailwindcss`, `prettier-plugin-tailwindcss`, `tailwindcss`, `tw-animate-css`
  - **`apps/mobile`:** `@react-native-async-storage/async-storage`, `@react-navigation/bottom-tabs`, `@react-navigation/elements`, `@react-navigation/native`, `date-fns`, `expo-audio`, `expo-build-properties`, `expo-dev-client`, `expo-splash-screen`, `expo-symbols`, `expo-system-ui`, `expo-web-browser`, `nativewind`, `zod`
  - **`packages/hooks`:** `@repo/trpc`, `typescript`
  - **`packages/store`:** `typescript`
  - **`packages/trpc`:** `@iptv/xtream-api`, `@types/node`
  - **`packages/utils`:** `eslint`, `typescript`

- [ ] **Add missing packages.**
  - **Instructions:** The `depcheck` tool has identified missing packages in some of the workspaces. Add the following packages to the `dependencies` in the corresponding `package.json` files.
  - **`apps/api`:** `dotenv`
  - **`apps/web`:** `dotenv`
  - **`apps/mobile`:** `expo-keep-awake`

## Code Refactoring

- [ ] **Refactor tRPC usage to use the shared `@repo/trpc` package.**
  - **Instructions:** The `apps/web` application is currently importing the tRPC router directly from the `apps/api` application. This is incorrect and defeats the purpose of the shared `@repo/trpc` package. Refactor the code to use the shared package.
  - **Steps:**
    1. In `packages/trpc`, export the `AppRouter` type.
    2. In `apps/web/lib/trpc.ts`, import `AppRouter` from `@repo/trpc` instead of `../../api/lib/router`.
    3. In `apps/api/lib/router.ts`, ensure that the `appRouter` is exported.
    4. In `apps/api/pages/api/trpc/[trpc].ts`, import the `appRouter` from `~/lib/router` and use it to create the tRPC handler.
    5. Verify that both `apps/web` and `apps/mobile` are using the `@repo/trpc` package for tRPC calls.
