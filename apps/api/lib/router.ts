import { channelsRouter } from "./routes/channels";
import { homeRouter } from "./routes/home";
import { moviesRouter } from "./routes/movies";
import { playlistsRouter } from "./routes/playlists";
import { seriesRouter } from "./routes/series";
import { t } from "./trpc";

export const appRouter = t.router({
  playlists: playlistsRouter,
  channels: channelsRouter,
  movies: moviesRouter,
  series: seriesRouter,
  home: homeRouter,
});
export type AppRouter = typeof appRouter;
