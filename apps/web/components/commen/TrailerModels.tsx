import { TrailerModalProps } from '@/lib/types';
import { X } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../ui/button';

export const TrailerModal: FC<TrailerModalProps> = ({ isOpen, onClose, trailerId }) => {
  if (!isOpen || !trailerId) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-50 w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden border border-white/10">
        <div className="flex p-2 justify-end bg-black/80 backdrop-blur-md">
          <Button
            className="pointer-events-auto p-2.5 text-white cursor-pointer rounded-full hover:bg-white/20 transition-colors duration-200 "
            onClick={onClose}
            aria-label="Close video player"
            title="Close video"
          >
            <X size={24} />
          </Button>
        </div>
        {/* hide the youtube title */}
        <iframe
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1`}
          className="w-full aspect-video"
        />
      </div>
    </div>
  );
};
