"use client";
import { usePlaylistStore } from "@/store/appStore";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function NavBar() {
  const { selectedPlaylist, selectPlaylist, playlists } =
    usePlaylistStore.getState();

  const handleUpdate = async () => {};

  const navItems = [
    { label: "Channels", href: "/channels" },
    { label: "Movies", href: "/movies" },
    { label: "Series", href: "/series" },
  ];

  return (
    <header className='bg-white/10 backdrop-blur-md border-b border-white/10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <Link href={"/"} className='flex items-center'>
            <div className='h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3'>
              <span className='text-white font-bold text-lg'>TV</span>
            </div>
            <span className='text-white text-xl font-bold'>StreamMax</span>
          </Link>
          <div className='hidden md:flex items-center space-x-4'>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`text-white hover:text-gray-300

                  `}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center gap-2 space-x-2'>
              <Select
                disabled={!playlists || playlists.length === 0}
                onValueChange={(e) => {
                  selectPlaylist(
                    playlists?.find((playlist) => playlist.id === Number(e)) ||
                      null
                  );
                }}
              >
                <SelectTrigger
                  className='w-[180px] text-gray-50 border-gray-500/50 bg-black/10 backdrop-blur-md'
                  value={selectedPlaylist?.username || "Playlist"}
                >
                  <SelectValue
                    placeholder={selectedPlaylist?.username || "Playlist"}
                  />
                </SelectTrigger>
                <SelectContent className='bg-black/20 text-gray-50 border-gray-900/50 backdrop-blur-md'>
                  {playlists &&
                    playlists.map((playlist) => (
                      <SelectItem
                        key={playlist.id}
                        value={playlist.id.toString()}
                        className='flex justify-between items-center px-4 py-2 w-full'
                      >
                        <span className='flex-1'>{playlist.username}</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div
                className={`h-2 w-2 rounded-full animate-pulse ${
                  selectedPlaylist?.status !== "active" ?
                    "bg-green-500"
                  : "bg-red-500"
                }`}
              />
              <button
                className={`cursor-pointer ml-3 p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none backdrop-blur-md rounded-full  flex items-center justify-center mr-3
                }`}
                onClick={handleUpdate}
              >
                <RefreshCcw className={`w-5 h-5 text-gray-200 `} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
