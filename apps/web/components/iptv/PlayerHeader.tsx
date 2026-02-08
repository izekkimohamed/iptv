import { Star } from 'lucide-react';
import Image from 'next/image';

import { trpc } from '@/lib/trpc';
import { Channel } from '@/lib/types';
import { usePlayerStore } from '@repo/store';

import { Button } from '../ui/button';

interface PlayerHeaderProps {
  selectedChannel?: Channel;
}

export default function PlayerHeader(props: PlayerHeaderProps) {
  const { selectedChannel } = props;
  const { title, poster } = usePlayerStore();
  const utils = trpc.useUtils();

  const { mutate: toggleFavorite } = trpc.channels.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.channels.getChannels.invalidate();
    },
  });

  const displayTitle = selectedChannel?.name || title;
  const displayIcon = selectedChannel?.streamIcon || poster;

  return (
    <div className="relative overflow-hidden group border-b border-white/10">
      <div className="relative z-10 flex items-center justify-between p-4.5">
        <div className="flex items-center gap-4">
          {displayIcon && (
       <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm  border-white/5 bg-white/5">
          <Image
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
            src={displayIcon}
            alt={displayTitle}
            onError={(e) => { e.currentTarget.src = '/icon.png' }}
          />

        </div>
          )}
          <div className="flex flex-col">
            <h3 className="text-xl font-black tracking-tighter text-white uppercase drop-shadow-lg">
              {displayTitle || 'Ready to Stream'}
            </h3>

          </div>
        </div>

        {selectedChannel && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() =>
                toggleFavorite({
                  channelsId: selectedChannel.id,
                  isFavorite: !selectedChannel.isFavorite,
                })
              }
              className="h-12 w-12 cursor-pointer rounded-sm bg-white/5 backdrop-blur-md border border-white/10 p-2 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Star
                className="h-6 w-6"
                fill={selectedChannel.isFavorite ? 'currentColor' : 'none'}
              />
            </Button>
          </div>
        )}
      </div>


    </div>
  );
}
