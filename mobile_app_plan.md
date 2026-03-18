# Mobile App Plan: React Native (Expo) IPTV Client

**Goal:** To develop a modern, user-friendly mobile application for consuming IPTV content (live channels, movies, series) using React Native with Expo, leveraging the provided backend API.

**Target Audience:** Users with Xtream IPTV subscriptions.

**Core Features:**

1.  **Playlist Management:**
    - Add new IPTV playlists (Xtream credentials: URL, Username, Password).
    - View existing playlists.
    - Update/Refresh playlist data (channels, movies, series, categories).
    - Delete playlists.
2.  **Live TV:**
    - Browse channels by categories.
    - View live channel streams.
    - Mark channels as favorites.
    - View EPG (Electronic Program Guide) for channels.
3.  **Movies:**
    - Browse movies by categories.
    - View movie details (from TMDB and Xtream).
    - Stream movies.
4.  **Series:**
    - Browse series by categories.
    - View series details (from Xtream).
    - Browse seasons and episodes.
    - Stream episodes.
5.  **Home Screen:**
    - Display popular movies and series (from TMDB).
    - Show newly added channels, movies, and series.
6.  **Search:**
    - Global search across channels, movies, and series within a selected playlist.
7.  **User Interface (UI) / User Experience (UX):**
    - Clean, intuitive, and modern design.
    - Responsive layout for various screen sizes.
    - Dark mode support (optional, but good for media consumption).
    - Optimized for media playback.

**Technical Stack:**

- **Frontend:** React Native with Expo
- **Navigation:** `expo-router` or `@react-navigation/native`
- **State Management:** `Zustand` or `React Context API` (for global state like active playlist, user credentials)
- **API Client:** `@tanstack/react-query` with `@trpc/client` for interacting with the tRPC API. Standard `fetch` for Next.js API routes.
- **Video Playback:** `expo-video` or `react-native-video`
- **Styling:** `NativeBase`, `Tamagui`, or a custom solution using `StyleSheet`.

**Architecture:**

- **App.tsx (or similar entry point):** Sets up providers (e.g., `TRPCProvider`, `AuthProvider`, `ThemeProvider`).
- **Navigation Stack:**
  - `AuthStack`: For playlist creation/login.
  - `MainAppStack`: Containing tabs for Home, Live TV, Movies, Series, Search, and Settings.
- **Screens:**
  - **Auth:** `AddPlaylistScreen`, `PlaylistSelectionScreen`
  - **Main Tabs:**
    - `HomeScreen`: Displays popular content, new additions.
    - `LiveTVScreen`: Channels list, categories, search, EPG.
    - `MoviesScreen`: Movies list, categories, search.
    - `SeriesScreen`: Series list, categories, search.
    - `SearchScreen`: Global search.
  - **Detail Screens:** `ChannelDetailScreen`, `MovieDetailScreen`, `SeriesDetailScreen`, `EpisodeDetailScreen`.
  - **Player Screen:** `VideoPlayerScreen`.
  - **Settings Screen:** For managing playlists, app settings.
- **Components:** Reusable UI components (buttons, cards, lists, video player controls).
- **Services/Hooks:** Custom hooks for data fetching (`useQuery` from `react-query`) and business logic.
- **Utils:** Helper functions (e.g., date formatting).

**Implementation Approach:**

1.  **Project Setup:** Initialize a new Expo project with TypeScript.
2.  **API Integration:**
    - Set up tRPC client.
    - Define API helper functions/hooks for each tRPC procedure and Next.js route.
3.  **Authentication & Playlist Management:**
    - Implement `createPlaylist` to allow users to add their Xtream credentials.
    - Store playlist data securely (e.g., `expo-secure-store`).
    - Display a list of added playlists (`getPlaylists`).
    - Allow users to select an active playlist.
4.  **Home Screen:**
    - Fetch and display data from `homeRouter.getHome` (popular movies/series).
    - Fetch and display data from `newRouter.getNewChannels`, `getNewMovies`, `getNewSeries`.
5.  **Live TV Section:**
    - Fetch channel categories (`channelsRouter.getCategories`).
    - Fetch channels by category or all (`channelsRouter.getChannels`).
    - Implement channel search.
    - Integrate video player for `channelsRouter.getShortEpg` (to get stream URL and EPG data).
    - Implement favorite toggle (`channelsRouter.toggleFavorite`).
6.  **Movies Section:**
    - Fetch movie categories (`moviesRouter.getMoviesCategories`).
    - Fetch movies by category (`moviesRouter.getMovies`).
    - Implement movie search.
    - Display movie details using `moviesRouter.getTmdbMovieDetails` and `moviesRouter.getMovieDetails`.
    - Integrate video player for movie streaming.
7.  **Series Section:**
    - Fetch series categories (`seriesRouter.getSeriesCategories`).
    - Fetch series by category (`seriesRouter.getseries`).
    - Implement series search.
    - Display series details using `seriesRouter.getSerie`.
    - Handle season and episode selection.
    - Integrate video player for episode streaming.
8.  **Global Search:**
    - Implement `homeRouter.globalSearch` functionality with debouncing for a smooth user experience.
    - Display results categorized by channels, movies, and series.
9.  **Error Handling and Loading States:** Implement robust error handling and display appropriate loading indicators throughout the app.
10. **Styling and Theming:** Define a consistent visual theme and apply it across components.

---

### **TODO Plan**

**Phase 1: Project Setup & Basic API Integration**

- **Status:** pending
  - Initialize new React Native (Expo) project (`npx create-expo-app`).
  - Install necessary dependencies: `react-navigation`, `react-query`, `trpc/client`, `zustand`, `expo-secure-store`, `expo-video`.
  - Configure tRPC client and context provider.
  - Create `TRPCProvider.tsx` to wrap the app with tRPC client.

**Phase 2: Authentication & Playlist Management**

- **Status:** pending
  - Design `AddPlaylistScreen` for Xtream credentials input (URL, Username, Password).
  - Implement `playlistsRouter.createPlaylist` mutation.
  - Securely store playlist credentials using `expo-secure-store`.
  - Implement `PlaylistSelectionScreen` to display `playlistsRouter.getPlaylists` query results.
  - Implement functionality to select and set the active playlist.
  - Add `playlistsRouter.deletePlaylist` mutation to remove playlists.

**Phase 3: Core Navigation & Home Screen**

- **Status:** pending
  - Set up `expo-router` for navigation, including Auth Stack and Main App Stack with tabs (Home, Live TV, Movies, Series, Search, Settings).
  - Design `HomeScreen` layout.
  - Integrate `homeRouter.getHome` query to display popular movies and series.
  - Integrate `newRouter.getNewChannels`, `getNewMovies`, `getNewSeries` queries to display new content.
  - Implement basic UI components for displaying content (e.g., carousels for popular/new items).

**Phase 4: Live TV Features**

- **Status:** pending
  - Design `LiveTVScreen` with category filter and channel list.
  - Implement `channelsRouter.getCategories` query for category filtering.
  - Implement `channelsRouter.getChannels` query to fetch channels based on selected category or all.
  - Implement channel search functionality.
  - Design `ChannelDetailScreen` to show EPG and provide playback.
  - Implement `channelsRouter.getShortEpg` query to fetch EPG data and stream URL.
  - Integrate `expo-video` for channel playback.
  - Implement `channelsRouter.toggleFavorite` mutation for favorite channels.

**Phase 5: Movies Features**

- **Status:** pending
  - Design `MoviesScreen` with category filter and movie list.
  - Implement `moviesRouter.getMoviesCategories` query for category filtering.
  - Implement `moviesRouter.getMovies` query to fetch movies.
  - Implement movie search functionality.
  - Design `MovieDetailScreen` to display TMDB and Xtream movie details.
  - Integrate `moviesRouter.getTmdbMovieDetails` and `moviesRouter.getMovieDetails` queries.
  - Integrate `expo-video` for movie playback.

**Phase 6: Series Features**

- **Status:** pending
  - Design `SeriesScreen` with category filter and series list.
  - Implement `seriesRouter.getSeriesCategories` query for category filtering.
  - Implement `seriesRouter.getseries` query to fetch series.
  - Implement series search functionality.
  - Design `SeriesDetailScreen` to display series, season, and episode details.
  - Integrate `seriesRouter.getSerie` query.
  - Integrate `expo-video` for episode playback.

**Phase 7: Search & Settings**

- **Status:** pending
  - Design `SearchScreen`.
  - Implement `homeRouter.globalSearch` query with debouncing.
  - Display search results categorized by content type.
  - Design `SettingsScreen` for app settings and playlist management (update/delete).
  - Implement `playlistsRouter.updatePlaylists` for refreshing playlist data.

**Phase 8: Polish & Testing**

- **Status:** pending
  - Implement consistent styling and theming (dark mode).
  - Add loading indicators and error boundaries.
  - Implement offline capabilities/caching (if applicable).
  - Perform thorough testing on various devices/simulators.
  - Optimize performance.
