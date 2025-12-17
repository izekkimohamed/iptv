import { trpc } from '@/lib/trpc';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';

interface PlayerHeaderProps {
  streamId: string;
  channelId: number;
  isFavorite?: boolean;
  name: string;
  poster: string;
}

export default function PlayerHeader(props: PlayerHeaderProps) {
  const { name, poster, channelId, isFavorite } = props;
  const utils = trpc.useUtils();
  const { mutate: toggleFavorite } = trpc.channels.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.channels.getChannels.invalidate();
    },
  });
  return (
    <div className=" border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="px-3 py-1.5 flex gap-3 items-center justify-between">
          {poster && (
            <Image
              width={50}
              height={50}
              src={poster}
              alt={name}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <h3 className="text-xl font-bold text-white flex items-center relative">{name}</h3>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() =>
              toggleFavorite({
                channelsId: channelId,
                isFavorite: !isFavorite,
              })
            }
            className="p-2 rounded-full text-amber-400 bg-white/10 hover:bg-white/20 cursor-pointer"
          >
            <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </div>
    </div>
  );
}
