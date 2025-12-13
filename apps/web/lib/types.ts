export interface Channel {
  id: number;
  name: string;
  streamType: string;
  streamId: number;
  streamIcon?: string;
  categoryId: number;
  playlistId?: number;
  isFavorite: boolean;
  url: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  type: string;
  playlistId: number;
}

export interface PlaylistProps {
  url: string;
  username: string;
  password: string;
}

export interface ItemsDetailsProps {
  container_extension?: string;
  description?: string;
  image: string;
  name: string;
  rating?: string;
  stream_id: string;
  seasons?: number[];
  episodes?: Episodes;
  tmdb?: Tmdb;
}

export interface Tmdb {
  id: number;
  title: string;
  overview?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
  releaseDate?: string;
  poster?: string | null;
  backdrop?: string | null;
  director?: string | null;
  cast?: { name: string; profilePath: string | null }[];
  videos?: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  }[];
}

export type Episode = {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    movie_image: string;
    plot: string;
    releasedate: string;
    rating: number;
    name: string;
    duration_secs: number;
    duration: string;
    bitrate: number;
  };
  video: unknown;
  audio: unknown;
  dispositiom: unknown;
  custom_sid: string;
  added: string;
  season: number;
  direct_source: string;
};

export type Episodes = {
  [key: string]: Episode[];
};

export interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  poster: string;
  title: string;
  autoPlay?: boolean;
  episodeNumber?: number;
  seasonId?: number;
}

export interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerId: string | null;
}

export interface HeaderSectionProps {
  name: string;
  rating?: string | number;
  runtime?: number;
  releaseDate?: string;
  genres?: Array<{ id: number; name: string }>;
}

export interface ActionButtonsProps {
  hasSeasons: boolean;
  onPlayMovie: () => void;
  hasTrailer: boolean;
  onPlayTrailer: () => void;
  videos?: Array<{ site: string; id: string; key: string }>;
}

export interface EpisodeCardProps {
  episode: Episode;
  tmdbPoster?: string;
  fallbackImage: string;
  onSelect: (episode: Episode) => void;
}

export interface CastSectionProps {
  cast?: Array<{
    name: string;
    profilePath?: string | null;
  }>;
}

export interface TrailersSectionProps {
  videos?: Array<{
    id: string;
    site: string;
    key: string;
    name: string;
  }>;
  onTrailerClick: (key: string) => void;
}

export interface EpisodesSectionProps {
  seasons?: number[];
  episodes?: Record<number, Episode[]>;
  tmdbPoster?: string;
  fallbackImage: string;
  containerExtension: string;
  streamId: string;
  image: string;
  tmdb?: Tmdb;
}
