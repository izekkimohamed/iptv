"use client";

import { trpc } from "@/lib/trpc";

export default function Home() {
  const { data: playlists, isLoading: isFetchingPlaylists } =
    trpc.playlist.getPlaylists.useQuery();

  if (isFetchingPlaylists) {
    return <div>Loading...</div>;
  }
  console.log(playlists);

  return (
    <div className='flex flex-col gap-4 max-w-md mx-auto p-4 rounded-md'>
      <h1 className='text-3xl font-bold'>Welcome to IPTV</h1>
      <p className='text-lg'>
        This is a demo of IPTV using TRPC and Next.js. You can create, update,
        and delete playlists.
      </p>

      {playlists &&
        playlists.map((playlist) => (
          <div key={playlist.id}>
            <h1>{playlist.username}</h1>
            <h2>{playlist.baseUrl}</h2>
          </div>
        ))}
    </div>
  );
}
