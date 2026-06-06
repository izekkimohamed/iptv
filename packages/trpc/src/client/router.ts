import type { Channel, Movie, Serie, Playlist, Category } from '../server/schema';

export type { Channel, Movie, Serie, Playlist, Category };

export type AppRouter = {

export type CursorType = number | undefined;

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: CursorType;
}

export interface AppRouter {
  channels: {
    getChannels: {
      input: {
        playlistId: number;
        categoryId?: number;
        favorites?: boolean;
        cursor?: number | null;
        limit?: number;
      };
      output: PaginatedResponse<Channel>;
    };
    getCategories: {
      input: { playlistId: number };
      output: Category[];
    };
    getShortEpg: {
      input: {
        url: string;
        username: string;
        password: string;
        channelId: number;
      };
      output: unknown[];
    };
    toggleFavorite: {
      input: {
        channelsId: number;
        isFavorite: boolean;
      };
      output: unknown;
    };
    updateCategoryChannels: {
      input: {
        playlistId: number;
        categoryId: number;
        url: string;
        username: string;
        password: string;
      };
      output: Channel[];
    };
    createChannels: {
      input: {
        url: string;
        username: string;
        password: string;
        playlistId: number;
      };
      output: unknown;
    };
    createChannelsCategories: {
      input: {
        url: string;
        username: string;
        password: string;
        playlistId: number;
      };
      output: unknown;
    };
  };
  movies: {
    getMovies: {
      input: {
        categoryId: number;
        playlistId: number;
        cursor?: number | null;
        limit?: number;
      };
      output: PaginatedResponse<Movie>;
    };
    getMovie: {
      input: {
        movieId: number;
        url: string;
        username: string;
        password: string;
      };
      output: unknown;
    };
    getTmdbMovieDetails: {
      input: {
        tmdbId: number;
        playlistId: number;
      };
      output: unknown[];
    };
    getMovieDetails: {
      input: {
        tmdbId: string;
        movieId: number;
      };
      output: unknown;
    };
    createMovie: {
      input: {
        url: string;
        username: string;
        password: string;
        playlistId: number;
      };
      output: unknown;
    };
    getMoviesCategories: {
      input: { playlistId: number };
      output: Category[];
    };
    createMoviesCategories: {
      input: {
        url: string;
        username: string;
        password: string;
        playlistId: number;
      };
      output: unknown;
    };
  };
  series: {
    getseries: {
      input: {
        categoryId: number;
        playlistId: number;
        cursor?: number | null;
        limit?: number;
      };
      output: PaginatedResponse<Serie>;
    };
    getSerie: {
      input: {
        serieId: number;
        url: string;
        username: string;
        password: string;
      };
      output: unknown;
    };
    getSerieEpisodes: {
      input: { playlistId: number; serieId: number };
      output: {
        info: unknown;
        seasons: number[];
        episodes: Record<string, { id: number; episodeNum: number; title: string; streamUrl: string; plot?: string }[]>;
        tmdb: unknown;
      };
    };
    createSerie: {
      input: {
        url: string;
        username: string;
        password: string;
        playlistId: number;
      };
      output: unknown;
    };
    getSeriesCategories: {
      input: { playlistId: number };
      output: Category[];
    };
    createSeriesCategories: {
      input: {
        url: string;
        username: string;
        password: string;
        playlistId: number;
      };
      output: unknown;
    };
  };
  playlists: {
    getPlaylists: {
      input: { userId: string };
      output: Playlist[];
    };
    createPlaylist: {
      input: {
        url: string;
        username: string;
        password: string;
        userId: string;
      };
      output: Playlist;
    };
    updatePlaylists: {
      input: Partial<Playlist> & { id: number };
      output: unknown;
    };
    deletePlaylist: {
      input: { id: number };
      output: unknown;
    };
  };
  home: {
    getHome: {
      input: { playlistId: number };
      output: unknown;
    };
    globalSearch: {
      input: {
        query: string;
        playlistId: number;
      };
      output: unknown;
    };
  };
  new: {
    getNewChannels: {
      input: { playlistId: number };
      output: Channel[];
    };
    getNewMovies: {
      input: { playlistId: number };
      output: Movie[];
    };
    getNewSeries: {
      input: { playlistId: number };
      output: Serie[];
    };
  };
}
