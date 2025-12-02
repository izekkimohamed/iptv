import { Film, Play, Star } from "lucide-react";
import Image from "next/image";
import React from "react";

interface MovieListProps {
  streamId: number;
  title: string;
  image: string;
  rating: string;
  onMovieClick: () => void;
}

const ItemsList: React.FC<MovieListProps> = ({
  image,
  title,
  rating,
  streamId,
  onMovieClick,
}) => {
  const cleanName = (name: string) => {
    return name
      .replace(/^[A-Z]{2}\s*-\s*/i, "")
      .replace(/\([^)]*\)/g, "")
      .trim();
  };

  const ratingValue = Number(rating).toFixed(1);
  const ratingPercentage = (Number(ratingValue) / 10) * 100;

  return (
    <div
      key={streamId}
      onClick={onMovieClick}
      className='relative h-[320px] rounded-xl overflow-hidden cursor-pointer group bg-slate-900/40 border border-white/10 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20'
    >
      {/* Background Image */}
      {(
        image &&
        (image.endsWith(".png") ||
          image.endsWith(".jpg") ||
          image.endsWith(".jpeg"))
      ) ?
        <>
          <Image
            src={image}
            alt={cleanName(title)}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            style={{ objectFit: "fill" }}
            className='w-full h-full transition-all duration-300 group-hover:scale-110 group-hover:brightness-75'
            priority={false}
            onError={(e) => {
              e.currentTarget.src = "./icon.png";
            }}
          />
          <div className='absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </>
      : <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900'>
          <div className='text-center space-y-2'>
            <Film className='w-12 h-12 text-gray-400 mx-auto' />
            <p className='text-xs font-semibold text-gray-300 line-clamp-3 px-2'>
              {cleanName(title)}
            </p>
          </div>
        </div>
      }

      {/* Play Button - Center Overlay */}
      <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20'>
        <div className='p-4 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/50 transform group-hover:scale-110 transition-transform duration-300'>
          <Play className='w-6 h-6 text-white fill-white' />
        </div>
      </div>

      {/* Rating Badge - Top Right */}
      <div className='absolute top-3 right-3 z-10 bg-black/70 rounded-full p-1 w-10 h-10 flex items-center justify-center'>
        <div className='relative'>
          <svg className='w-12 h-12 transform -rotate-90' viewBox='0 0 100 100'>
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='rgba(255,255,255,0.2)'
              strokeWidth='8'
            />
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke={`hsl(${
                ratingPercentage > 50 ? 120
                : ratingPercentage > 30 ? 45
                : 0
              }, 100%, 50%)`}
              strokeWidth='6'
              strokeLinecap='round'
              strokeDasharray={`${2.83 * ratingPercentage} 283`}
              className='transition-all duration-300'
            />
          </svg>
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-xs font-bold text-white'>{ratingValue}</span>
          </div>
        </div>
      </div>

      {/* Content - Bottom Section */}
      <div className='absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300'>
        <div className='space-y-3'>
          <h3 className='text-sm font-bold text-white line-clamp-2 leading-tight'>
            {cleanName(title)}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default ItemsList;
