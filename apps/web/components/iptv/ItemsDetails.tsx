"use client";
import { usePlaylistStore } from "@/store/appStore";
import {
  Calendar,
  ChevronLeft,
  Clock,
  PlayCircle,
  User2,
  X,
  YoutubeIcon,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import VideoPlayer from "../videoPlayer";

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
  releasedate,
  stream_id,
  seasons,
  episodes,
  tmdb,
}) => {
  const { selectedPlaylist } = usePlaylistStore();
  const [playing, setPlaying] = useState(false);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(() => {
    // Initialize with the first available season or 1
    return seasons && seasons.length > 0 ? seasons[0] : 1;
  });
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);

  const { baseUrl, username, password } = selectedPlaylist!;
  const srcUrl = `${baseUrl}/movie/${username}/${password}/${stream_id}.${container_extension}`;

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

  // Filter episodes by selected season
  const filteredEpisodes: Episode[] =
    episodes && episodes[selectedSeason] ? episodes[selectedSeason] : [];
  // Sorted episodes for the selected season (fallback to empty array)
  const sortedEpisodes =
    Array.isArray(filteredEpisodes) ?
      [...filteredEpisodes].sort((a, b) => a.episode_num - b.episode_num)
    : [];

  // Get episode source URL
  const getEpisodeSrcUrl = (episode: Episode) =>
    `${baseUrl}/series/${username}/${password}/${episode.id}.${episode.container_extension}`;

  // Format duration from seconds or string
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
    <div className='relative h-full '>
      <div
        className='absolute inset-0 bg-center bg-no-repeat bg-cover '
        style={{
          backgroundImage: `url(${tmdb?.backdrop || image})`,
        }}
      >
        <div className='absolute inset-0 z-10 bg-black/50' />
      </div>
      {/* Back button */}
      <div className='absolute z-20  top-1.5 left-1 '>
        <button
          onClick={() => window.history.back()}
          className='flex items-center gap-2 px-4 py-2 text-white transition-all duration-300 border rounded-full cursor-pointer group bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/20 '
        >
          <ChevronLeft className='w-5 h-5 transition-transform group-hover:-translate-x-1' />
          <span className='font-medium'>Back</span>
        </button>
      </div>
      <div className='relative h-full pt-1.5 overflow-hidden '>
        {/* Content */}
        <div className='relative z-20 h-full rounded-md p-5 mx-auto overflow-y-auto border max-w-7xl bg-black/30 backdrop-blur-lg  border-white/10'>
          <div className='flex flex-col  gap-8 xl:flex-row '>
            {/* Poster */}
            <div className='relative flex justify-center'>
              <Image
                src={tmdb?.poster || image}
                alt={name || "Movie Image"}
                className='transition-transform duration-500 transform shadow-2xl w-80 border border-white/15 rounded-md '
                width={300}
                height={500}
                priority={false}
              />
            </div>

            {/* Movie Info */}
            <div className='flex flex-col flex-1 space-y-6'>
              <div className='flex items-start justify-between gap-4'>
                <h1 className='text-5xl font-extrabold text-transparent uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text'>
                  {cleanName(name)}
                </h1>
                {rating && (
                  <span className='flex px-2 py-1 text-sm font-bold text-white border-2 border-yellow-500 rounded-lg shadow-lg '>
                    <span>⭐</span>
                    <span className='ml-1'>
                      {parseFloat(rating).toFixed(1)}
                    </span>
                  </span>
                )}
              </div>

              <div>
                <h3 className='mb-2 text-xl font-bold text-gray-500'>
                  Synopsis
                </h3>
                <p className='text-lg leading-relaxed text-gray-50'>
                  {tmdb?.overview || description || "No description available."}
                </p>
              </div>

              {tmdb?.director && (
                <div>
                  <h4 className='mb-1 text-lg font-semibold text-gray-500'>
                    Director
                  </h4>
                  <p className='text-gray-50'>{tmdb.director}</p>
                </div>
              )}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='col-span-1 md:col-span-2'>
                  <h4 className='mb-3 text-lg font-semibold text-gray-500'>
                    Movie Information
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-300'>Release Date:</span>
                      <span className='text-white'>
                        {formatDate(tmdb?.releaseDate || releasedate)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-300'>Rating:</span>
                      <span className='flex items-center text-yellow-400'>
                        <span className='mr-1'>⭐</span>
                        {Number(rating).toFixed(1)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-300'>Genre:</span>
                      <span className='text-white'>
                        {tmdb?.genres?.map((g) => g.name).join(", ") || "N/A"}
                      </span>
                    </div>
                    {tmdb?.runtime && (
                      <div className='flex justify-between'>
                        <span className='text-gray-300'>Duration:</span>
                        <span className='text-white'>
                          {formatRuntime(tmdb.runtime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Buttons - Only show Watch Movie if it's not a series */}
              <div className='z-20 flex flex-wrap gap-4 pt-4'>
                {!seasons && (
                  <button
                    className='flex items-center px-6 py-3 text-lg font-semibold text-white transition-all bg-blue-600 shadow-lg cursor-pointer rounded-xl hover:shadow-blue-600/50'
                    onClick={() => setPlaying(true)}
                  >
                    ▶ Watch Movie
                  </button>
                )}
                <button
                  disabled={!tmdb?.videos || tmdb.videos.length === 0}
                  onClick={() => setTrailer(tmdb?.videos?.[0]?.key || null)}
                  className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold text-red-400 transition-all border r bg-white/10 rounded-xl border-white/20 backdrop-blur-md ${
                    !tmdb?.videos || tmdb.videos.length === 0 ?
                      "cursor-not-allowed opacity-50"
                    : "cursor-pointer  hover:bg-red-400/20 hover:shadow-lg hover:shadow-red-400/30"
                  } `}
                >
                  <YoutubeIcon className='' /> Watch Trailer
                </button>
              </div>
            </div>
          </div>
          {seasons && seasons.length > 0 && (
            <div className='flex border border-white/15 p-2 rounded-md gap-4 mt-3'>
              {/* Seasons Section */}
              <div className='flex-1 max-w-[200px] border-r border-white/15 pr-2'>
                <div className='flex flex-col gap-3 '>
                  {seasons.map((season) => {
                    const seasonEpisodeCount = filteredEpisodes.filter(
                      (ep) => ep.season === season
                    ).length;
                    return (
                      <button
                        key={season}
                        onClick={() => setSelectedSeason(season)}
                        className={`px-2 py-3 text-white transition-all rounded-lg cursor-pointer backdrop-blur-md border ${
                          selectedSeason === season ?
                            "bg-blue-600 hover:bg-blue-700 border-blue-500"
                          : "bg-white/10 hover:bg-white/20 border-white/20"
                        }`}
                      >
                        <span className='font-semibold'>Season {season}</span>
                        {seasonEpisodeCount > 0 && (
                          <span className='ml-2 text-sm opacity-80'>
                            ({seasonEpisodeCount} eps)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Episodes Section */}
              {Array.isArray(filteredEpisodes) &&
                filteredEpisodes.length > 0 && (
                  <div className='flex-1'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 max-h-[550px] overflow-y-scroll'>
                      {filteredEpisodes &&
                        filteredEpisodes.map((episode) => (
                          <div
                            key={episode.id}
                            className='relative p-4 transition-all border rounded-lg cursor-pointer group bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5'
                            onClick={() => setPlayingEpisode(episode)}
                          >
                            <Image
                              src={
                                episode.info?.movie_image ||
                                tmdb?.poster ||
                                image
                              }
                              alt={
                                episode.title ||
                                episode.info?.name ||
                                `Episode ${episode.episode_num}`
                              }
                              className='w-full h-40 mb-4 rounded-md object-cover'
                              width={300}
                              height={200}
                            />
                            <div
                              className={
                                episode.info?.movie_image ? "mt-4" : ""
                              }
                            >
                              <div className='flex items-start justify-between mb-2'>
                                <h4 className='flex-1 font-semibold text-white'>
                                  <span className='text-blue-400'>
                                    E{episode.episode_num}:
                                  </span>{" "}
                                  {episode.title ||
                                    episode.info?.name ||
                                    `Episode ${episode.episode_num}`}
                                </h4>
                                {episode.info?.rating > 0 && (
                                  <span className='flex items-center px-2 py-1 ml-2 text-xs text-yellow-400 bg-yellow-400/20 rounded'>
                                    ⭐{" "}
                                    {parseFloat(
                                      episode.info.rating.toString()
                                    ).toFixed(1)}
                                  </span>
                                )}
                              </div>

                              {episode.info?.plot && (
                                <p className='mb-3 text-sm text-gray-300 line-clamp-3'>
                                  {episode.info.plot}
                                </p>
                              )}

                              <div className='flex items-center gap-3 text-xs text-gray-400'>
                                {episode.info?.releasedate && (
                                  <span className='flex items-center gap-1'>
                                    <Calendar size={12} />
                                    {formatDate(episode.info.releasedate)}
                                  </span>
                                )}
                                {formatDuration(
                                  episode.info?.duration ||
                                    episode.info?.duration_secs
                                ) && (
                                  <span className='flex items-center gap-1'>
                                    <Clock size={12} />
                                    {formatDuration(
                                      episode.info?.duration ||
                                        episode.info?.duration_secs
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Play overlay on hover */}
                            <div className='absolute inset-0 flex items-center justify-center transition-opacity opacity-0 pointer-events-none group-hover:opacity-100'>
                              {!episode.info?.movie_image && (
                                <PlayCircle
                                  size={32}
                                  className='text-white/80'
                                />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          {/* No episodes message */}
          {seasons && seasons.length > 0 && sortedEpisodes.length === 0 && (
            <div className='mt-5  text-center bg-white/5 rounded-lg border border-white/10'>
              <p className='text-gray-400'>
                No episodes available for Season {selectedSeason}
              </p>
            </div>
          )}

          {/* Cast Carousel */}
          {tmdb?.cast && tmdb.cast.length > 0 && (
            <div className='mt-10'>
              <h3 className='mb-4 text-2xl font-bold text-white'>Cast</h3>
              <div className='flex gap-4 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent'>
                {tmdb.cast.map((actor, idx) => (
                  <div
                    key={idx}
                    className='flex-shrink-0 w-32 overflow-hidden transition-transform border-2 rounded-md bg-white/10 backdrop-blur-md border-white/10 '
                  >
                    {actor.profilePath ?
                      <Image
                        src={actor.profilePath}
                        alt={actor.name}
                        className='object-cover w-auto h-auto transition-transform duration-300 '
                        width={128}
                        height={192}
                      />
                    : <div className='flex items-center justify-center w-full h-48 bg-gray-700/30'>
                        <User2 size={48} className='text-gray-400' />
                      </div>
                    }
                    <p className='px-2 mt-2 text-sm text-center text-white truncate'>
                      {actor.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {tmdb?.videos && tmdb.videos.length > 0 && (
            <div className='mt-10'>
              <h3 className='mb-4 text-2xl font-bold text-white'>Trailers</h3>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {tmdb.videos
                  .filter((v) => v.site === "YouTube")
                  .map((video) => (
                    <div
                      key={video.id}
                      className='relative overflow-hidden transition-transform border cursor-pointer group rounded-xl border-white/10 '
                      onClick={() => setTrailer(video.key)}
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                        alt={video.name}
                        className='object-cover w-full h-48'
                        width={400}
                        height={225}
                      />
                      <div className='absolute inset-0 flex items-center justify-center transition-colors bg-black/40 group-hover:bg-black/60'>
                        <span className='text-3xl text-gray-200'>▶</span>
                      </div>
                      <p className='p-2 text-sm text-center text-gray-200 bg-black/50'>
                        {video.name}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for main movie */}
      {playing && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black/70 backdrop-blur-lg'
            onClick={() => setPlaying(false)}
          />
          <div className='relative z-50 w-full max-w-5xl mx-auto shadow-2xl rounded-2xl'>
            <button
              className='absolute z-50 p-2 text-black cursor-pointer rounded-full -top-8 -right-8 bg-white/60 hover:bg-white/80'
              onClick={() => setPlaying(false)}
            >
              <X size={24} />
            </button>
            <VideoPlayer src={srcUrl} poster={image} title={name} autoPlay />
          </div>
        </div>
      )}

      {/* Modal for episode playback */}
      {playingEpisode && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black/70 backdrop-blur-lg'
            onClick={() => setPlayingEpisode(null)}
          />
          <div className='relative z-50 w-full max-w-5xl mx-auto shadow-2xl rounded-2xl'>
            <button
              className='absolute z-50 p-2 text-black cursor-pointer rounded-full -top-8 -right-8 bg-white/60 hover:bg-white/80'
              onClick={() => setPlayingEpisode(null)}
            >
              <X size={24} />
            </button>
            <VideoPlayer
              src={getEpisodeSrcUrl(playingEpisode)}
              poster={playingEpisode.info?.movie_image || image}
              title={`${name} - S${playingEpisode.season}E${playingEpisode.episode_num}: ${playingEpisode.title}`}
              autoPlay
            />
            {/* <VideoJSPlayer videoUrl={getEpisodeSrcUrl(playingEpisode)} /> */}
          </div>
        </div>
      )}

      {/* Modal for trailers */}
      {trailer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black/70 backdrop-blur-lg'
            onClick={() => setTrailer(null)}
          />
          <div className='relative z-50 w-full max-w-4xl mx-auto  shadow-2xl rounded-2xl'>
            <button
              className='absolute z-50 p-2 text-black cursor-pointer rounded-full -top-8 -right-8 bg-white/60 hover:bg-white/80'
              onClick={() => setTrailer(null)}
            >
              <X size={24} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer}?autoplay=1`}
              title='YouTube Trailer'
              className='w-full h-[500px]'
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
