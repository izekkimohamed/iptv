"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { usePlaylistStore } from "@/store/appStore";
import Image from "next/image";

export default function IPTVHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: favoriteChannels } = trpc.channels.getChannels.useQuery(
    {
      favorites: true,
      playlistId: playlist?.id || 0,
    },
    {
      enabled: !!playlist,
    }
  );

  // Hero carousel data
  const trendingMovies = [
    {
      id: 1,
      title: "The Dark Knight",
      description:
        "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
      year: "2008",
      rating: "9.0",
      genre: "Action, Crime, Drama",
      backdrop:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop",
      duration: "152 min",
      trending: "#1",
    },
    {
      id: 2,
      title: "Inception",
      description:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      year: "2010",
      rating: "8.8",
      genre: "Action, Sci-Fi, Thriller",
      backdrop:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop",
      duration: "148 min",
      trending: "#2",
    },
    {
      id: 3,
      title: "Interstellar",
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival when Earth becomes uninhabitable.",
      year: "2014",
      rating: "8.6",
      genre: "Adventure, Drama, Sci-Fi",
      backdrop:
        "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1920&h=1080&fit=crop",
      duration: "169 min",
      trending: "#3",
    },
    {
      id: 4,
      title: "Dune",
      description:
        "Paul Atreides leads nomadic tribes in a revolt against the galactic emperor and his father's evil nemesis when they assassinate his family.",
      year: "2021",
      rating: "8.0",
      genre: "Action, Adventure, Drama",
      backdrop:
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop",
      duration: "155 min",
      trending: "#4",
    },
  ];

  const recentChannels = [
    {
      id: 1,
      name: "ESPN HD",
      logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop",
      category: "Sports",
      viewers: "2.3M",
      isLive: true,
    },
    {
      id: 2,
      name: "BBC News",
      logo: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&h=100&fit=crop",
      category: "News",
      viewers: "1.8M",
      isLive: true,
    },
    {
      id: 3,
      name: "Discovery HD",
      logo: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop",
      category: "Documentary",
      viewers: "945K",
      isLive: true,
    },
    {
      id: 4,
      name: "HBO Max",
      logo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=100&fit=crop",
      category: "Movies",
      viewers: "1.2M",
      isLive: false,
    },
    {
      id: 5,
      name: "National Geographic",
      logo: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop",
      category: "Documentary",
      viewers: "756K",
      isLive: true,
    },
    {
      id: 6,
      name: "Fox Sports",
      logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop",
      category: "Sports",
      viewers: "890K",
      isLive: true,
    },
  ];

  const continueWatching = [
    {
      id: 1,
      title: "Stranger Things",
      episode: "S4 E7",
      progress: 65,
      thumbnail:
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=170&fit=crop",
      duration: "52 min",
      remaining: "18 min left",
    },
    {
      id: 2,
      title: "The Witcher",
      episode: "S2 E3",
      progress: 23,
      thumbnail:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=170&fit=crop",
      duration: "58 min",
      remaining: "45 min left",
    },
    {
      id: 3,
      title: "Avengers: Endgame",
      episode: "Movie",
      progress: 78,
      thumbnail:
        "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=170&fit=crop",
      duration: "181 min",
      remaining: "40 min left",
    },
    {
      id: 4,
      title: "House of Dragons",
      episode: "S1 E5",
      progress: 12,
      thumbnail:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop",
      duration: "68 min",
      remaining: "60 min left",
    },
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trendingMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [trendingMovies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trendingMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + trendingMovies.length) % trendingMovies.length
    );
  };

  const currentMovie = trendingMovies[currentSlide];

  return (
    <div className='overflow-y-auto bg-black/20 backdrop-blur-md font-mono'>
      {/* Hero Carousel Section */}
      <div className='relative h-[70vh] overflow-hidden'>
        <div
          className='absolute inset-0 bg-cover bg-center transition-all duration-1000'
          style={{ backgroundImage: `url(${currentMovie.backdrop})` }}
        >
          <div className='absolute inset-0 bg-black/50'></div>
        </div>

        <div className='relative z-10 h-full flex items-center'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
              <div className='space-y-6'>
                <div className='flex items-center space-x-4'>
                  <span className='bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold'>
                    {currentMovie.trending} TRENDING
                  </span>
                  <div className='flex items-center space-x-2'>
                    <span className='text-yellow-400'>⭐</span>
                    <span className='text-white font-semibold'>
                      {currentMovie.rating}
                    </span>
                  </div>
                </div>

                <h1 className='text-5xl lg:text-6xl font-bold text-white leading-tight'>
                  {currentMovie.title}
                </h1>

                <div className='flex items-center space-x-4 text-gray-300'>
                  <span>{currentMovie.year}</span>
                  <span>•</span>
                  <span>{currentMovie.duration}</span>
                  <span>•</span>
                  <span>{currentMovie.genre}</span>
                </div>

                <p className='text-lg text-gray-200 leading-relaxed max-w-2xl'>
                  {currentMovie.description}
                </p>

                <div className='flex space-x-4'>
                  <button className='bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center'>
                    <svg
                      className='w-5 h-5 mr-2'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M8 5v14l11-7z' />
                    </svg>
                    Watch Now
                  </button>
                  <button className='bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm'>
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation */}
        <button
          onClick={prevSlide}
          className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </button>

        {/* Carousel Indicators */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20'>
          {trendingMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-purple-500" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12'>
        {/* Favorite Channels */}
        <section>
          <h2 className='text-2xl font-bold text-white mb-6 flex items-center'>
            <span className='mr-3'>⭐</span>
            Favorite Channels
          </h2>
          <div className='flex space-x-4 overflow-x-auto pb-2'>
            {favoriteChannels &&
              favoriteChannels.map((channel) => (
                <Link
                  href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                  key={channel.id}
                  className='min-w-[200px] bg-white/10 backdrop-blur-md rounded-xl py-4 px-2 border border-white/20 hover:bg-white/20  cursor-pointer'
                >
                  <div className='flex items-center gap-2 transition-all duration-300 transform hover:scale-105'>
                    <div className='relative '>
                      <Image
                        className='object-cover w-auto h-auto'
                        width={70}
                        height={70}
                        src={
                          channel.streamIcon ||
                          "https://via.placeholder.com/150x150"
                        }
                        alt={channel.name}
                      />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-white font-semibold text-sm text-center'>
                        {channel.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
        <section>
          <h2 className='text-2xl font-bold text-white mb-6 flex items-center'>
            <span className='mr-3'>🕒</span>
            Recently Watched Channels
          </h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
            {recentChannels.map((channel) => (
              <div
                key={channel.id}
                className='bg-white/10 backdrop-blur-md rounded-xl p-4 border  border-white/20 hover:bg-white/20 transition-colors cursor-pointer'
              >
                <div className='relative mb-3'>
                  <Image
                    className='object-cover w-full h-full'
                    fill
                    src={channel.logo}
                    alt={channel.name}
                  />
                  {channel.isLive && (
                    <div className='absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full animate-pulse'></div>
                  )}
                </div>
                <h3 className='text-white font-semibold text-sm text-center mb-1 truncate'>
                  {channel.name}
                </h3>
                <p className='text-gray-400 text-xs text-center'>
                  {channel.category}
                </p>
                <p className='text-gray-300 text-xs text-center'>
                  {channel.viewers}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Continue Watching */}
        <section>
          <h2 className='text-2xl font-bold text-white mb-6 flex items-center'>
            <span className='mr-3'>▶️</span>
            Continue Watching
          </h2>
          <div className='flex space-x-4 overflow-x-auto pb-2'>
            {continueWatching.map((item) => (
              <div
                key={item.id}
                className='bg-white/10 backdrop-blur-md rounded-xl overflow-hidden min-w-[300px] border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer group'
              >
                <div className='relative'>
                  <Image
                    className='object-cover w-full h-full'
                    fill
                    src={item.thumbnail}
                    alt={item.title}
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                    <div className='bg-white/20 rounded-full p-2'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M8 5v14l11-7z' />
                      </svg>
                    </div>
                  </div>
                  <div className='absolute bottom-0 left-0 right-0 h-1 bg-gray-600'>
                    <div
                      className='h-full bg-purple-500 transition-all duration-300'
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className='p-4'>
                  <h3 className='text-white font-semibold text-sm mb-1 truncate'>
                    {item.title}
                  </h3>
                  <p className='text-gray-400 text-xs mb-2'>{item.episode}</p>
                  <div className='flex justify-between items-center text-xs text-gray-300'>
                    <span>{item.remaining}</span>
                    <span>{item.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
