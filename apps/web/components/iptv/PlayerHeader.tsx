import { Star } from 'lucide-react';
import Image from 'next/image';

import { trpc } from '@/lib/trpc';
import { Channel } from '@/lib/types';

import { Button } from '../ui/button';

interface PlayerHeaderProps {
  selectedChannel?: Channel;
}

export default function PlayerHeader(props: PlayerHeaderProps) {
  const { selectedChannel } = props;
  const utils = trpc.useUtils();
  const { mutate: toggleFavorite } = trpc.channels.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.channels.getChannels.invalidate();
    },
  });
  return (
    <div className="border-b border-white/10">
      <div className="flex items-center justify-between">
        {selectedChannel && (
          <>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              {selectedChannel.streamIcon && (
                <Image
                  width={30}
                  height={30}
                  src={selectedChannel.streamIcon}
                  alt={selectedChannel.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <h3 className="relative flex items-center text-xl font-bold text-white">
                {selectedChannel.name}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() =>
                  toggleFavorite({
                    channelsId: selectedChannel.id,
                    isFavorite: !selectedChannel.isFavorite,
                  })
                }
                className="cursor-pointer rounded-full bg-white/10 p-2 text-primary hover:bg-white/20"
              >
                <Star
                  className="h-5 w-5"
                  fill={selectedChannel.isFavorite ? 'currentColor' : 'none'}
                />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
