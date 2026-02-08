import { X } from 'lucide-react';
import { FC } from 'react';

import { TrailerModalProps } from '@/lib/types';

import { Button } from '../ui/button';

export const TrailerModal: FC<TrailerModalProps> = ({ isOpen, onClose, trailerId }) => {
  if (!isOpen || !trailerId) return null;

  return (
     <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-50 w-full max-w-5xl overflow-hidden rounded-sm border border-white/10 shadow-2xl">
        <div className="flex justify-end bg-black/80 p-2 backdrop-blur-md">
          <Button
            className="pointer-events-auto cursor-pointer rounded-full p-2.5 text-white transition-colors duration-200 hover:bg-white/20"
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
          className="aspect-video w-full"
        />
      </div>
    </div>
  );
};
