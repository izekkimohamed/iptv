# IPTV Player Monorepo

This is a monorepo for a cross-platform IPTV player application. It includes a web version that can be packaged as a desktop app, a mobile version for Android and iOS, and a backend API.

## Features

- **Cross-Platform:** Works on the web, desktop (Windows, macOS, Linux), and mobile (Android, iOS).
- **Monorepo:** Uses pnpm workspaces and Turborepo for managing the project.
- **Type-Safe API:** Uses tRPC for building a type-safe API between the backend and the clients.
- **Modern Tech Stack:** Built with Next.js, React, React Native (Expo), and TypeScript.
- **Database:** Uses Drizzle ORM with a PostgreSQL database.
- **Desktop App:** The web application can be packaged as a desktop application using Tauri.

## Monorepo Structure

This project is a monorepo managed with pnpm and Turborepo.

### `apps`

-   `api`: A Next.js application that serves as the backend. It uses tRPC to expose the API endpoints and connects to a PostgreSQL database using Drizzle ORM. It also interacts with IPTV services using the Xtream Codes API.
-   `mobile`: A React Native application built with Expo. It uses Expo Router for navigation, tRPC for data fetching, and Zustand for state management.
-   `web`: A Next.js application for the web and desktop. It uses Tailwind CSS for styling and can be packaged as a desktop application with Tauri.

### `packages`

-   `trpc`: A shared package that contains the tRPC router, procedures, and types. This package is used by the `api`, `web`, and `mobile` applications to ensure a consistent and type-safe API.

## Detailed Folder Structure

### `apps/api`

-   **`app/api`**: Contains the Next.js API routes, organized by functionality:
    -   `cron`: Cron job related API endpoints.
    -   `health`: Health check endpoints.
    -   `live-matches`: Endpoints for live match data.
    -   `match-details`: Endpoints for detailed match information.
    -   `trpc`: The entry point for the tRPC API.
-   **`lib`**: Core tRPC setup and route definitions:
    -   `router.ts`: Main tRPC router definition.
    -   `trpc.ts`: tRPC context and initialization.
    -   `routes`: Individual tRPC route definitions for different data types (channels, home, movies, playlists, series).
-   **`services`**: Business logic for interacting with data sources and external APIs:
    -   `categoryService.ts`: Logic for managing categories.
    -   `channelService.ts`: Logic for managing channels.
    -   `movieService.ts`: Logic for managing movies.
    -   `playlistUpdateService.ts`: Logic for updating playlists.
    -   `seriesService.ts`: Logic for managing series.
    -   `userService.ts`: Logic for user-related operations.
-   **`utils`**: Helper functions and type definitions:
    -   `cleanName.ts`: Utility for cleaning names.
    -   `types.ts`: Shared TypeScript type definitions.
    -   `xtream.ts`: Utilities for interacting with the Xtream Codes API.

### `apps/mobile`

-   **`app`**: Expo Router's file-system based routing for screens:
    -   `_layout.tsx`: Root layout for the mobile application.
    -   `search.tsx`: Search screen.
    -   `(tabs)`: Group of tab-based navigation screens (e.g., `channels.tsx`, `index.tsx`, `movies/`, `series/`).
    -   `player/index.tsx`: Video player screen.
    -   `playlists/index.tsx`, `playlists/manage.tsx`: Playlist management screens.
-   **`components`**: Reusable UI components:
    -   `ChannelRow.tsx`, `Header.tsx`, `PlaylistForm.tsx`, `PlaylistSetup.tsx`: General components.
    -   `365/`: Components specific to the '365' feature.
    -   `navigation/`: Navigation-related components.
    -   `player/`: Player-specific UI components.
-   **`hooks`**: Custom React hooks for mobile-specific logic:
    -   `useHudOpacity.ts`, `usePlayer.ts`, `usePlayerGestures.tsx`, `usePlayGlow.ts`: Player-related hooks.
-   **`lib`**: Client-side utilities:
    -   `trpc.ts`: tRPC client setup for mobile.
    -   `utils.ts`: General utility functions.
-   **`store`**: Zustand state management stores:
    -   `appStore.ts`, `player-store.ts`, `recentUpdate.ts`, `useFavoritesTeamsStore.ts`, `watchedStore.ts`: Various application state stores.

### `apps/web`

-   **`app`**: Next.js file-system based routing for web pages:
    -   `favicon.ico`, `globals.css`, `layout.tsx`, `page.tsx`: Core Next.js files.
    -   `365/`, `channels/`, `movies/`, `playlists/`, `series/`: Pages for different content types.
-   **`components`**: Reusable UI components:
    -   `Navbar.tsx`, `PlayerArea.tsx`, `PlaylistForm.tsx`: General components.
    -   `365/`, `channels/`, `commen/`, `home/`, `iptv/`, `providers/`, `ui/`: Categorized components.
-   **`hooks`**: Custom React hooks for web-specific logic:
    -   `useAutoScrollToSelected.ts`, `useDebounce.ts`, `useDetails.ts`, `useTauri.ts`: Various utility hooks.
-   **`lib`**: Client-side utilities:
    -   `trpc.ts`: tRPC client setup for web.
    -   `types.ts`: Shared TypeScript type definitions.
    -   `utils.ts`: General utility functions.
-   **`src-tauri`**: Files related to the Tauri desktop application build:
    -   `build.rs`, `Cargo.lock`, `Cargo.toml`: Rust build configuration.
    -   `tauri.conf.json`: Tauri application configuration.
    -   `capabilities/`, `icons/`, `src/`: Tauri-specific resources and Rust source code.
-   **`store`**: Zustand state management stores:
    -   `appStore.ts`, `player-store.ts`, `recentUpdate.ts`, `useFavoritesTeamsStore.ts`, `watchedStore.ts`: Various application state stores.

### `packages/trpc`

-   **`src/client`**: Contains the client-side setup for tRPC, allowing web and mobile applications to interact with the backend in a type-safe manner.
-   **`src/server`**: Contains the server-side tRPC router and its procedures, defining the API endpoints and their logic.

## Getting Started

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the necessary environment variables (e.g., database connection string).

3.  **Run the development servers:**
    ```bash
    pnpm dev
    ```
    This will start the `api`, `web`, and `mobile` applications in development mode.