"use client";
import { usePlaylistStore } from "@/store/appStore";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Play,
  PlayCircle,
  Star,
  User2,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import VideoPlayer from "../videoPlayer";
import { usePathname, useSearchParams } from "next/navigation";

interface Tmdb {
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

interface ItemsDetailsProps {
  image: string;
  rating: string;
  releasedate: string;
  description: string;
  stream_id?: number;
  name: string;
  container_extension?: string;
  seasons?: number[];
  episodes?: Episodes;
  tmdb: Tmdb | null;
}

const ItemsDetails: React.FC<ItemsDetailsProps> = ({
  container_extension,
  description,
  image,
  name,
  rating,
  stream_id,
  seasons,
  episodes,
  tmdb,
}) => {
  const searchParams = useSearchParams();
  const playState = searchParams.get("play");
  const resumeSeriesState = searchParams.get("resumeSeries");
  const seriePoster = searchParams.get("poster");
  const serieTitle = searchParams.get("title");
  const episodeId = searchParams.get("episodeNumber");
  const episodeSrc = searchParams.get("src");
  const seasonId = searchParams.get("seasonId");
  const { selectedPlaylist } = usePlaylistStore();

  const [playing, setPlaying] = useState(playState === "true" || false);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(() => {
    return seasons && seasons.length > 0 ? seasons[0] : 1;
  });

  const mediaType = usePathname().includes("/movies") ? "movie" : "series";

  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);
  const [resumeSeries, setResumeSeries] = useState<boolean>(
    resumeSeriesState === "true" || false
  );

  const { baseUrl, username, password } = selectedPlaylist!;
  const srcUrl = `${baseUrl}/movie/${username}/${password}/${stream_id}.${
    container_extension || "mp4"
  }`;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const cleanName = (name: string) => {
    return name
      .replace(/^[A-Z]{2}\s*-\s*/i, "")
      .replace(/\([^)]*\)/g, "")
      .trim();
  };

  const filteredEpisodes: Episode[] =
    episodes && episodes[selectedSeason] ? episodes[selectedSeason] : [];

  const sortedEpisodes =
    Array.isArray(filteredEpisodes) ?
      [...filteredEpisodes].sort((a, b) => a.episode_num - b.episode_num)
    : [];

  const getEpisodeSrcUrl = (episode: Episode) =>
    `${baseUrl}/series/${username}/${password}/${episode.id}.${episode.container_extension}`;

  const formatDuration = (duration: string | number | undefined) => {
    if (!duration) return null;

    if (typeof duration === "string") {
      return duration;
    }

    if (typeof duration === "number") {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    return null;
  };

  if (!selectedPlaylist) {
    return null;
  }

  return (
    <div className='relative h-full'>
      {/* Background with gradient overlay */}
      <div
        className='absolute inset-0 bg-center bg-no-repeat bg-cover'
        style={{
          backgroundImage: `url(${tmdb?.backdrop || image})`,
        }}
      >
        <div className='absolute inset-0 bg-gradient-to-b from-black/80 to-black/70 backdrop-blur-md' />
      </div>

      <div className='relative h-full overflow-hidden'>
        {/* Content */}
        <div className='relative z-20 h-full p-6 sm:p-8 overflow-y-auto border-t border-white/10'>
          {/* Back button */}
          <div className='absolute z-20 top-6 left-6'>
            <button
              onClick={() => window.history.back()}
              className='flex items-center gap-2 px-4 py-2 text-white transition-all duration-300 border rounded-full cursor-pointer group hover:bg-white/20 hover:border-white/40  border-white/20'
            >
              <ChevronLeft className='w-5 h-5 transition-transform group-hover:-translate-x-1' />
              <span className='font-semibold text-sm'>Back</span>
            </button>
          </div>

          {/* Main Content */}
          <div className='max-w-7xl mx-auto pt-12'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
              {/* Poster */}
              <div className='lg:col-span-1 flex justify-center lg:justify-start'>
                <div className='relative group'>
                  <div className='absolute -inset-2  group-hover:opacity-70 transition duration-500' />
                  <Image
                    src={tmdb?.poster || image}
                    alt={name || "Movie Image"}
                    className='relative rounded-lg shadow-2xl  border border-white/10'
                    width={400}
                    height={600}
                    priority={true}
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className='lg:col-span-2 flex flex-col space-y-6'>
                {/* Title & Rating */}
                <div className='space-y-3'>
                  <h1 className='text-4xl sm:text-5xl font-bold text-white leading-tight'>
                    {cleanName(name)}
                  </h1>
                  <div className='flex items-center gap-4 flex-wrap'>
                    {rating && (
                      <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'>
                        <Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
                        <span className='text-lg font-bold text-yellow-300'>
                          {parseFloat(rating).toFixed(1)}/10
                        </span>
                      </div>
                    )}
                    {tmdb?.runtime && (
                      <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10'>
                        <Clock className='w-5 h-5 text-gray-300' />
                        <span className='text-sm font-medium text-gray-300'>
                          {formatRuntime(tmdb.runtime)}
                        </span>
                      </div>
                    )}
                    {tmdb?.releaseDate && (
                      <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10'>
                        <Calendar className='w-5 h-5 text-gray-300' />
                        <span className='text-sm font-medium text-gray-300'>
                          {new Date(tmdb.releaseDate).getFullYear()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Genres */}
                {tmdb?.genres && tmdb.genres.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {tmdb.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className='px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-500/20 rounded-full border border-blue-500/30'
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Synopsis */}
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold text-white'>Synopsis</h3>
                  <p className='text-gray-300 leading-relaxed line-clamp-4'>
                    {tmdb?.overview ||
                      description ||
                      "No description available."}
                  </p>
                </div>

                {/* Director */}
                {tmdb?.director && (
                  <div className='space-y-2'>
                    <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>
                      Director
                    </h4>
                    <p className='text-white font-medium'>{tmdb.director}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='flex flex-wrap gap-3 pt-4'>
                  {!seasons && (
                    <button
                      className='flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 rounded-lg shadow-lg hover:shadow-blue-600/50 group'
                      onClick={() => setPlaying(true)}
                    >
                      <Play className='w-5 h-5 fill-white group-hover:scale-110 transition-transform' />
                      Watch Movie
                    </button>
                  )}
                  <button
                    disabled={!tmdb?.videos || tmdb.videos.length === 0}
                    onClick={() => setTrailer(tmdb?.videos?.[0]?.key || null)}
                    className={`flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 border ${
                      !tmdb?.videos || tmdb.videos.length === 0 ?
                        "cursor-not-allowed opacity-50 text-gray-400 border-gray-500/20 bg-gray-500/10"
                      : "text-red-300 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20"
                    }`}
                  >
                    <Youtube className='w-5 h-5' />
                    Trailer
                  </button>
                </div>
              </div>
            </div>

            {/* Seasons & Episodes */}
            {seasons && seasons.length > 0 && (
              <div className='mt-16 space-y-6'>
                <h2 className='text-3xl font-bold text-white'>Episodes</h2>

                {/* Season Selector */}
                <div className='flex gap-2 overflow-x-auto pb-2'>
                  {seasons.map((season) => {
                    const seasonEpisodeCount = episodes?.[season]?.length || 0;
                    return (
                      <button
                        key={season}
                        onClick={() => setSelectedSeason(season)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap border ${
                          selectedSeason === season ?
                            "cursor-pointer text-white border-blue-400/50 shadow-lg shadow-blue-500/20"
                          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        Season {season}
                        {seasonEpisodeCount > 0 && (
                          <span className='ml-2 text-xs opacity-80'>
                            ({seasonEpisodeCount})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Episodes Grid */}
                {(
                  Array.isArray(filteredEpisodes) && filteredEpisodes.length > 0
                ) ?
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {sortedEpisodes.map((episode) => (
                      <div
                        key={episode.id}
                        onClick={() => setPlayingEpisode(episode)}
                        className='relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20'
                      >
                        {/* Episode Image */}
                        <div className='relative h-40 overflow-hidden bg-slate-800'>
                          <Image
                            src={
                              episode.info?.movie_image || tmdb?.poster || image
                            }
                            alt={`S${episode.season}E${episode.episode_num}`}
                            fill
                            className='object-cover group-hover:scale-110 transition-transform duration-300'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                            <div className='p-3 rounded-full bg-blue-600'>
                              <Play className='w-6 h-6 text-white fill-white' />
                            </div>
                          </div>
                        </div>

                        {/* Episode Info */}
                        <div className='p-4 space-y-3'>
                          <div className='flex items-start justify-between gap-2'>
                            <h4 className='font-semibold text-white flex-1'>
                              <span className='text-blue-400 text-sm'>
                                E{episode.episode_num}:
                              </span>{" "}
                              <span className='line-clamp-2'>
                                {episode.title ||
                                  episode.info?.name ||
                                  `Episode ${episode.episode_num}`}
                              </span>
                            </h4>
                            {episode.info?.rating > 0 && (
                              <span className='flex items-center gap-1 px-2 py-1 text-xs font-semibold text-yellow-300 bg-yellow-500/20 rounded-full border border-yellow-500/30 flex-shrink-0'>
                                <Star className='w-3 h-3 fill-current' />
                                {parseFloat(
                                  episode.info.rating.toString()
                                ).toFixed(1)}
                              </span>
                            )}
                          </div>

                          {episode.info?.plot && (
                            <p className='text-xs text-gray-400 line-clamp-2'>
                              {episode.info.plot}
                            </p>
                          )}

                          <div className='flex items-center gap-3 text-xs text-gray-500'>
                            {episode.info?.releasedate && (
                              <span className='flex items-center gap-1'>
                                <Calendar size={14} />
                                {formatDate(episode.info.releasedate)}
                              </span>
                            )}
                            {formatDuration(
                              episode.info?.duration ||
                                episode.info?.duration_secs
                            ) && (
                              <span className='flex items-center gap-1'>
                                <Clock size={14} />
                                {formatDuration(
                                  episode.info?.duration ||
                                    episode.info?.duration_secs
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                : <div className='py-12 text-center bg-white/5 rounded-lg border border-white/10'>
                    <p className='text-gray-400'>
                      No episodes available for Season {selectedSeason}
                    </p>
                  </div>
                }
              </div>
            )}

            {/* Cast Carousel */}
            {tmdb?.cast && tmdb.cast.length > 0 && (
              <div className='mt-16 space-y-6'>
                <h2 className='text-3xl font-bold text-white'>Cast</h2>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                  {tmdb.cast.slice(0, 12).map((actor, idx) => (
                    <div
                      key={idx}
                      className='group rounded-lg overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-300 bg-white/5 hover:bg-white/10'
                    >
                      {actor.profilePath ?
                        <div className='relative h-48 overflow-hidden bg-slate-800'>
                          <Image
                            src={actor.profilePath}
                            alt={actor.name}
                            fill
                            className='object-cover group-hover:scale-110 transition-transform duration-300'
                          />
                        </div>
                      : <div className='h-48 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900'>
                          <User2 size={48} className='text-gray-600' />
                        </div>
                      }
                      <p className='px-3 py-2 text-xs font-medium text-center text-gray-200 bg-black/40'>
                        {actor.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trailers Section */}
            {tmdb?.videos && tmdb.videos.length > 0 && (
              <div className='mt-16 space-y-6 pb-12'>
                <h2 className='text-3xl font-bold text-white'>Trailers</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {tmdb.videos
                    .filter((v) => v.site === "YouTube")
                    .slice(0, 6)
                    .map((video) => (
                      <div
                        key={video.id}
                        onClick={() => setTrailer(video.key)}
                        className='relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20'
                      >
                        <Image
                          src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                          alt={video.name}
                          width={400}
                          height={225}
                          className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300'
                        />
                        <div className='absolute inset-0 flex items-center justify-center transition-colors bg-black/40 group-hover:bg-black/60'>
                          <div className='p-3 rounded-full bg-red-600'>
                            <Youtube className='w-6 h-6 text-white fill-white' />
                          </div>
                        </div>
                        <p className='absolute bottom-0 left-0 right-0 px-3 py-2 text-xs font-medium text-white bg-gradient-to-t from-black/80 to-transparent line-clamp-2'>
                          {video.name}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {playing && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='absolute inset-0 bg-black/80 backdrop-blur-md '
            onClick={() => setPlaying(false)}
          />
          <div className='relative z-50 w-full max-w-5xl shadow-2xl rounded-xl '>
            <button
              className='absolute z-50 p-2 text-white cursor-pointer rounded-full -top-16 right-5 hover:bg-white/20 transition-colors'
              onClick={() => setPlaying(false)}
            >
              <X size={28} />
            </button>
            <VideoPlayer src={srcUrl} poster={image} title={name} autoPlay />
          </div>
        </div>
      )}

      {/* Episode Playback Modal */}
      {playingEpisode && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='absolute inset-0 bg-black/80 backdrop-blur-md'
            onClick={() => setPlayingEpisode(null)}
          />
          <div className='relative z-50 w-full max-w-5xl shadow-2xl rounded-xl '>
            <button
              className='absolute z-50 p-2 text-white cursor-pointer rounded-sm -top-5 -right-5 bg-white/20 hover:bg-white/30 transition-colors'
              onClick={() => setPlayingEpisode(null)}
            >
              <X size={28} />
            </button>
            <VideoPlayer
              src={getEpisodeSrcUrl(playingEpisode)}
              poster={image}
              title={`${name} - S${playingEpisode.season}E${playingEpisode.episode_num}: ${playingEpisode.title}`}
              autoPlay
              episodeNumber={+playingEpisode.episode_num!}
              seasonId={+playingEpisode.season!}
            />
          </div>
        </div>
      )}
      {/* Resume Episode Playback Modal */}
      {resumeSeries && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='absolute inset-0 bg-black/80 backdrop-blur-md'
            onClick={() => setResumeSeries(false)}
          />
          <div className='relative z-50 w-full max-w-5xl shadow-2xl rounded-xl '>
            <button
              className='absolute z-50 p-2 text-white cursor-pointer rounded-sm -top-5 -right-5 bg-white/20 hover:bg-white/30 transition-colors'
              onClick={() => setResumeSeries(false)}
            >
              <X size={28} />
            </button>
            <VideoPlayer
              src={episodeSrc!}
              poster={seriePoster!}
              title={`${serieTitle!} - S${seasonId}E${episodeId}`}
              autoPlay
              episodeNumber={+episodeId!}
              seasonId={+seasonId!}
            />
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {trailer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div className='absolute inset-0' onClick={() => setTrailer(null)} />
          <div className='relative z-50 w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden'>
            <button
              className='absolute z-50 p-2 text-white cursor-pointer rounded-full -top-12 right-0 hover:bg-white/20 transition-colors'
              onClick={() => setTrailer(null)}
            >
              <X size={28} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer}?autoplay=1`}
              title='YouTube Trailer'
              className='w-full aspect-video'
              allow='autoplay; encrypted-media'
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsDetails;
