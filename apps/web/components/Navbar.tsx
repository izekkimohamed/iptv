"use client";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { RefreshCcw, Minus, X, Menu } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const dateString = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
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

  const navItems = [
    { label: "Channels", href: "/channels", icon: "📺" },
    { label: "Movies", href: "/movies", icon: "🎬" },
    { label: "Series", href: "/series", icon: "📺" },
    { label: "Add Playlist", href: "/playlists/add", icon: "➕" },
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
    <header className='sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-slate-950/95 via-blue-950/95 to-slate-950/95 backdrop-blur-xl'>
      <div className='px-4 mx-auto max-w-[90vw] sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 gap-4'>
          {/* Logo */}
          <Link href={"/"} className='flex items-center flex-shrink-0'>
            <div className='flex items-center justify-center w-9 h-9 mr-3 rounded-lg bg-gradient-to-br from-[#e94560] to-[#f39c12] shadow-lg shadow-orange-500/20'>
              <span className='text-lg font-bold text-white'>▶</span>
            </div>
            <span className='text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hidden sm:inline'>
              StreamMax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className='items-center hidden space-x-1 md:flex flex-1 ml-8'>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className='px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200'>
                  <span className='mr-1'>{item.icon}</span>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Center - Playlist Selector & Refresh */}
          <div className='flex items-center gap-3 flex-shrink-0'>
            <div className='relative group'>
              <Select
                disabled={!playlists || playlists.length === 0}
                onValueChange={(e) => handlePlaylistSelect(e)}
              >
                <SelectTrigger
                  className='w-[160px] md:w-[180px] bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg text-white border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-900/30 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50'
                  value={selectedPlaylist?.username || "Select"}
                >
                  <SelectValue
                    placeholder={selectedPlaylist?.username || "Playlist"}
                  />
                </SelectTrigger>
                <SelectContent className='text-white bg-slate-900 border border-blue-500/30 rounded-lg shadow-xl'>
                  {playlists &&
                    playlists.map((playlist) => (
                      <SelectItem
                        key={playlist.id}
                        value={playlist.id.toString()}
                        className='cursor-pointer hover:bg-blue-600/30 focus:bg-blue-600/50 transition-colors'
                      >
                        <div className='flex items-center gap-2'>
                          <span className='w-2 h-2 bg-green-500 rounded-full' />
                          {playlist.username}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <button
              className='p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/30 rounded-lg transition-all duration-200 disabled:opacity-50 group'
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
              title='Refresh playlists'
            >
              <RefreshCcw
                className={cn(
                  "w-5 h-5 text-blue-300 group-hover:text-blue-200 transition-colors",
                  isPending && "animate-spin"
                )}
              />
            </button>
          </div>

          {/* Right Side - Time & Controls */}
          <div className='flex items-center gap-3 ml-auto -mr-[6rem] flex-shrink-0'>
            {/* Time Display */}
            <div className='hidden sm:block px-3 py-1 bg-white/5 rounded-lg border border-white/10'>
              <div className='text-xs text-gray-400 font-mono'>{time}</div>
            </div>

            {/* Window Controls */}
            <div className='flex items-center gap-2 ml-2 pl-2 border-l border-white/10'>
              <button
                onClick={minimizeApp}
                className='flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 hover:text-yellow-300 transition-all duration-200 group'
                title='Minimize'
              >
                <Minus className='w-4 h-4' />
              </button>
              <button
                onClick={quitApp}
                className='flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all duration-200 group'
                title='Exit'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
