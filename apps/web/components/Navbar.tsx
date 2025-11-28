"use client";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { RefreshCcw, Minus, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";

async function quitApp() {
  await invoke("quit_app");
}

async function minimizeApp() {
  await invoke("minimize_app");
}

export default function NavBar() {
  const { selectedPlaylist, selectPlaylist, removePlaylist } =
    usePlaylistStore();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const dateString = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      setTime(`${dateString} ${timeString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: playlists } = trpc.playlists.getPlaylists.useQuery();

  useEffect(() => {
    if (playlists?.length) {
      selectPlaylist(playlists[0]);
    }
  }, [playlists, selectPlaylist]);

  const {
    mutate: handleUpdate,
    isPending,
    error,
  } = trpc.playlists.updatePlaylists.useMutation({
    onSuccess: async () => {
      await utils.playlists.getPlaylists.invalidate();
      await utils.channels.getCategories.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.movies.getMoviesCategories.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.series.getSeriesCategories.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.channels.getChannels.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.movies.getMovies.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
      await utils.series.getseries.invalidate({
        playlistId: selectedPlaylist?.id || 0,
      });
    },
  });
  // const { mutate: deletePlaylist } = trpc.playlists.deletePlaylist.useMutation({
  //   onSuccess: async (data, variables) => {
  //     removePlaylist(variables.playlistId);
  //     alert(data.success);
  //   },
  // });

  const navItems = [
    { label: "Channels", href: "/channels" },
    { label: "Movies", href: "/movies" },
    { label: "Series", href: "/series" },
    { label: "add Playlist", href: "/playlists/add" },
  ];

  const handlePlaylistSelect = async (id: string) => {
    await utils.channels.getChannels.cancel({
      playlistId: Number(id),
    });
    selectPlaylist(
      playlists?.find((playlist) => playlist.id === Number(id)) || null
    );
    router.replace("/");
    document.cookie = `selectedPlaylistId=${id}; path=/; max-age=31536000`;
  };

  return (
    <header className='border-b backdrop-blur-md border-white/10'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <Link href={"/"} className='flex items-center'>
            <div className='flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-gradient-to-r from-[#e94560] to-[#f39c12]'>
              <span className='text-lg font-bold text-white'>▶</span>
            </div>
            <span className='text-xl font-bold text-white'>StreamMax</span>
          </Link>
          <div className='items-center hidden space-x-4 md:flex'>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className='text-white hover:text-gray-300'>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center gap-2 space-x-2'>
              <Select
                disabled={!playlists || playlists.length === 0}
                onValueChange={(e) => handlePlaylistSelect(e)}
              >
                <SelectTrigger
                  className="w-[180px] bg-blue-900/10 rounded-md flex items-center justify-between text-white cursor-pointer  placeholder:text-white border-gray-500 [&_svg:not([class*='text-'])]:text-red-500]"
                  value={selectedPlaylist?.username || "Playlist"}
                >
                  <SelectValue
                    placeholder={selectedPlaylist?.username || "Playlist"}
                  />
                </SelectTrigger>
                <SelectContent className='text-white bg-blue-900 border rounded-md border-gray-500/10'>
                  {playlists &&
                    playlists.map((playlist) => (
                      <SelectItem
                        key={playlist.id}
                        value={playlist.id.toString()}
                        className='flex items-center justify-between w-full px-4 py-2 cursor-pointer'
                      >
                        <span className='flex-1'>{playlist.username}</span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <button
                className='cursor-pointer ml-3 p-2 bg-accent/15  border-none backdrop-blur-md rounded-full flex items-center justify-center'
                disabled={isPending}
                onClick={() => {
                  if (selectedPlaylist) {
                    handleUpdate({
                      url: selectedPlaylist.baseUrl,
                      username: selectedPlaylist.username,
                      password: selectedPlaylist.password,
                      playlistId: selectedPlaylist.id,
                    });
                  }
                }}
              >
                <RefreshCcw
                  className={cn(
                    "w-6 h-6 text-slate-300",
                    isPending && "animate-spin"
                  )}
                />
              </button>
            </div>

            <div className=' absolute right-2 flex items-center gap-4 ml-6 pl-6'>
              <div className='text-md text-gray-300 font-mono'>{time}</div>
              <button
                onClick={minimizeApp}
                className='flex items-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[#f39c12] transition-colors'
                title='Minimize'
              >
                <Minus className='w-5 h-5 text-gray-950' />
              </button>
              <button
                onClick={quitApp}
                className='flex items-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[#e94560] transition-colors'
                title='Exit'
              >
                <X className='w-5 h-5 text-gray-950' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
