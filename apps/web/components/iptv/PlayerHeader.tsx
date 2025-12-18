import { trpc } from '@/lib/trpc';
import { Channel } from '@/lib/types';
import { Star } from 'lucide-react';
import Image from 'next/image';
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
    <div className="border-b border-white/10 ">
      <div className="flex items-center justify-between">
        {selectedChannel && (
          <>
            <div className="px-5 py-4 flex gap-3 items-center justify-between">
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
              <h3 className="text-xl font-bold text-white flex items-center relative">
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
                className="p-2 rounded-full text-amber-400 bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                <Star
                  className="w-5 h-5"
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
