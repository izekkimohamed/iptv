### **TODO Plan**

**Phase 1: Project Setup & Basic API Integration**

- **Status:** completed
  - [x] Initialize new React Native (Expo) project (`npx create-expo-app`).
  - [x] Remove the git repository initialized by Expo inside `apps/med`.
  - [x] Install necessary dependencies: `react-navigation`, `react-query`, `trpc/client`, `zustand`, `expo-secure-store`, `expo-video`, `expo-router`, `expo-av`.
  - [x] Configure tRPC client and context provider.
  - [x] Create `TRPCProvider.tsx` to wrap the app with tRPC client.

**Phase 2: Authentication & Playlist Management**

- **Status:** completed
  - [x] Design `AddPlaylistScreen` for Xtream credentials input (URL, Username, Password).
  - [x] Implement `playlistsRouter.createPlaylist` mutation.
  - [x] Securely store playlist credentials using `expo-secure-store`.
  - [x] Implement `PlaylistSelectionScreen` to display `playlistsRouter.getPlaylists` query results.
  - [x] Implement functionality to select and set the active playlist.
  - [x] Add `playlistsRouter.deletePlaylist` mutation to remove playlists.

**Phase 3: Core Navigation & Home Screen**

- **Status:** completed
  - [x] Set up `expo-router` for navigation, including Auth Stack and Main App Stack with tabs (Home, Live TV, Movies, Series, Search, Settings).
  - [x] Design `HomeScreen` layout.
  - [x] Integrate `homeRouter.getHome` query to display popular movies and series.
  - [x] Integrate `newRouter.getNewChannels`, `getNewMovies`, `getNewSeries` queries to display new content.
  - [x] Implement basic UI components for displaying content (e.g., carousels for popular/new items).

**Phase 4: Live TV Features**

- **Status:** completed
  - [x] Design `LiveTVScreen` with category filter and channel list.
  - [x] Implement `channelsRouter.getCategories` query for category filtering.
  - [x] Implement `channelsRouter.getChannels` query to fetch channels based on selected category or all.
  - [x] Implement channel search functionality.
  - [x] Design `ChannelDetailScreen` to show EPG and provide playback.
  - [x] Implement `channelsRouter.getShortEpg` query to fetch EPG data and stream URL.
  - [x] Integrate `expo-av` for channel playback.
  - [x] Implement `channelsRouter.toggleFavorite` mutation for favorite channels.

**Phase 5: Movies Features**

- **Status:** completed
  - [x] Design `MoviesScreen` with category filter and movie list.
  - [x] Implement `moviesRouter.getMoviesCategories` query for category filtering.
  - [x] Implement `moviesRouter.getMovies` query to fetch movies.
  - [x] Implement movie search functionality.
  - [x] Design `MovieDetailScreen` to display TMDB and Xtream movie details.
  - [x] Integrate `moviesRouter.getTmdbMovieDetails` and `moviesRouter.getMovieDetails` queries.
  - [x] Integrate `expo-av` for movie playback.

**Phase 6: Series Features**

- **Status:** completed
  - [x] Design `SeriesScreen` with category filter and series list.
  - [x] Implement `seriesRouter.getSeriesCategories` query for category filtering.
  - [x] Implement `seriesRouter.getseries` query to fetch series.
  - [x] Implement series search functionality.
  - [x] Design `SeriesDetailScreen` to display series, season, and episode details.
  - [x] Integrate `seriesRouter.getSerie` query.
  - [ ] Integrate `expo-av` for episode playback.

**Phase 7: Search & Settings**

- **Status:** completed
  - [x] Design `SearchScreen`.
  - [x] Implement `homeRouter.globalSearch` query with debouncing.
  - [x] Display search results categorized by content type.
  - [x] Design `SettingsScreen` for app settings and playlist management (update/delete).
  - [x] Implement `playlistsRouter.updatePlaylists` for refreshing playlist data.

**Phase 8: Polish & Testing**

- **Status:** pending
  - [ ] Implement consistent styling and theming (dark mode).
  - [x] Add loading indicators and error boundaries.
  - [ ] Implement offline capabilities/caching (if applicable).
  - [ ] Perform thorough testing on various devices/simulators.
  - [ ] Optimize performance.
