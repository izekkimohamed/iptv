"use client";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import React from "react";

interface Channel {
  id: number;
  name: string;
  streamType: string;
  streamId: number;
  streamIcon?: string;
  categoryId: number;
  playlistId?: number;
  isFavorite: boolean;
  url: string;
}

interface PlayerHeaderProps {
  selectedChannel?: Channel;
}

export default function PlayerHeader({ selectedChannel }: PlayerHeaderProps) {
  const utils = trpc.useUtils();
  const { mutate: toggleFavorite } = trpc.channels.toggleFavorite.useMutation({
    onSuccess: () => {
      console.log("favorite toggled");
      utils.channels.getChannels.invalidate();
    },
  });
  return (
    <div className='bg-black/20 backdrop-blur-md border border-white/10 '>
      <div className='flex items-center justify-between'>
        <div>
          {selectedChannel ?
            <div className='p-3 flex items-center justify-between'>
              <h3 className='text-xl font-bold text-white flex items-center relative'>
                {selectedChannel.streamIcon && (
                  <Image
                    className='mr-2 w-auto h-auto'
                    width={24}
                    height={24}
                    src={selectedChannel.streamIcon}
                    alt={selectedChannel.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                {selectedChannel.name}
              </h3>
            </div>
          : ""}
        </div>
        {selectedChannel && (
          <div className='flex items-center space-x-2'>
            <button
              onClick={() =>
                toggleFavorite({
                  channelsId: selectedChannel.id,
                  isFavorite: !selectedChannel.isFavorite,
                })
              }
              className='p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer'
            >
              {/*a heart icon*/}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className={`h-6 w-6 ${selectedChannel.isFavorite ? "fill-red-400 text-red-400" : "text-gray-400 fill-gray-400"}`}
                // fill='none'
                // stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
