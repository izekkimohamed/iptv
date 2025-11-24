// components/iptv/MovieList.tsx
import { Film } from "lucide-react";
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
    return name.replace(/^\|[A-Z]{2}\|\s*/, "");
  };
  return (
    <div
      key={streamId}
      onClick={onMovieClick}
      className='bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer group  relative h-[400]'
    >
      {(
        (image && image.endsWith(".png")) ||
        image.endsWith(".jpg") ||
        image.endsWith(".jpeg")
      ) ?
        <Image
          src={image}
          alt={cleanName(title)}
          fill
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          style={{ objectFit: "cover" }}
          priority={false}
          className='w-auto h-auto transition-opacity group-hover:opacity-90'
        />
      : <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-filter backdrop-blur-sm'>
          <p className='flex flex-col items-center text-sm font-semibold text-center text-white line-clamp-2'>
            <Film className='w-10 h-10 text-white ' />
            {cleanName(title)}
          </p>
        </div>
      }
      <div className='absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100'>
        <div className='p-3 rounded-full bg-white/20'>
          <svg
            className='w-8 h-8 text-white'
            fill='currentColor'
            viewBox='0 0 24 24'
          >
            <path d='M8 5v14l11-7z' />
          </svg>
        </div>
      </div>
      <div className='absolute flex space-x-2 top-2 right-2'>
        <div className='flex items-center px-2 py-1 text-xs text-yellow-400 rounded-full bg-black/60'>
          <span>⭐</span>
          <span className='ml-1'>{Number(rating).toFixed(1)}</span>
        </div>
      </div>

      <div className='absolute bottom-0 left-0 right-0 h-20 p-4 bg-black/60 backdrop-filter backdrop-blur-md'>
        <h3 className='mb-2 text-sm font-semibold text-center text-white line-clamp-2'>
          {cleanName(title)}
        </h3>
      </div>
    </div>
  );
};

export default ItemsList;
