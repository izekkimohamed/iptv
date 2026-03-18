### **TODO Plan**

**Phase 1: Project Setup & Basic API Integration**

- **Status:** completed
  - [ ] Initialize new React Native (Expo) project (`npx create-expo-app`).
  - [ ] Remove the git repository initialized by Expo inside `apps/med`.
  - [ ] Install necessary dependencies: `react-navigation`, `react-query`, `trpc/client`, `zustand`, `expo-secure-store`, `expo-video`, `expo-router`, `expo-av`.
  - [ ] Configure tRPC client and context provider.
  - [ ] Create `TRPCProvider.tsx` to wrap the app with tRPC client.

**Phase 2: Authentication & Playlist Management**

- **Status:** completed
  - [ ] Design `AddPlaylistScreen` for Xtream credentials input (URL, Username, Password).
  - [ ] Implement `playlistsRouter.createPlaylist` mutation.
  - [ ] Securely store playlist credentials using `expo-secure-store`.
  - [ ] Implement `PlaylistSelectionScreen` to display `playlistsRouter.getPlaylists` query results.
  - [ ] Implement functionality to select and set the active playlist.
  - [ ] Add `playlistsRouter.deletePlaylist` mutation to remove playlists.

**Phase 3: Core Navigation & Home Screen**

- **Status:** completed
  - [ ] Set up `expo-router` for navigation, including Auth Stack and Main App Stack with tabs (Home, Live TV, Movies, Series, Search, Settings).
  - [ ] Design `HomeScreen` layout.
  - [ ] Integrate `homeRouter.getHome` query to display popular movies and series.
  - [ ] Integrate `newRouter.getNewChannels`, `getNewMovies`, `getNewSeries` queries to display new content.
  - [ ] Implement basic UI components for displaying content (e.g., carousels for popular/new items).

**Phase 4: Live TV Features**

- **Status:** completed
  - [ ] Design `LiveTVScreen` with category filter and channel list.
  - [ ] Implement `channelsRouter.getCategories` query for category filtering.
  - [ ] Implement `channelsRouter.getChannels` query to fetch channels based on selected category or all.
  - [ ] Implement channel search functionality.
  - [ ] Design `ChannelDetailScreen` to show EPG and provide playback.
  - [ ] Implement `channelsRouter.getShortEpg` query to fetch EPG data and stream URL.
  - [ ] Integrate `expo-av` for channel playback.
  - [ ] Implement `channelsRouter.toggleFavorite` mutation for favorite channels.

**Phase 5: Movies Features**

- **Status:** completed
  - [ ] Design `MoviesScreen` with category filter and movie list.
  - [ ] Implement `moviesRouter.getMoviesCategories` query for category filtering.
  - [ ] Implement `moviesRouter.getMovies` query to fetch movies.
  - [ ] Implement movie search functionality.
  - [ ] Design `MovieDetailScreen` to display TMDB and Xtream movie details.
  - [ ] Integrate `moviesRouter.getTmdbMovieDetails` and `moviesRouter.getMovieDetails` queries.
  - [ ] Integrate `expo-av` for movie playback.

**Phase 6: Series Features**

- **Status:** completed
  - [ ] Design `SeriesScreen` with category filter and series list.
  - [ ] Implement `seriesRouter.getSeriesCategories` query for category filtering.
  - [ ] Implement `seriesRouter.getseries` query to fetch series.
  - [ ] Implement series search functionality.
  - [ ] Design `SeriesDetailScreen` to display series, season, and episode details.
  - [ ] Integrate `seriesRouter.getSerie` query.
  - [ ] Integrate `expo-av` for episode playback.

**Phase 7: Search & Settings**

- **Status:** completed
  - [ ] Design `SearchScreen`.
  - [ ] Implement `homeRouter.globalSearch` query with debouncing.
  - [ ] Display search results categorized by content type.
  - [ ] Design `SettingsScreen` for app settings and playlist management (update/delete).
  - [ ] Implement `playlistsRouter.updatePlaylists` for refreshing playlist data.

**Phase 8: Polish & Testing**

- **Status:** pending
  - [ ] Implement consistent styling and theming (dark mode).
  - [ ] Add loading indicators and error boundaries.
  - [ ] Implement offline capabilities/caching (if applicable).
  - [ ] Perform thorough testing on various devices/simulators.
  - [ ] Optimize performance.
