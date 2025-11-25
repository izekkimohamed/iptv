"use client";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { LogOutIcon, RefreshCcw, Trash2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

async function quitApp() {
  await invoke("quit_app");
}

export default function NavBar() {
  const { selectedPlaylist, selectPlaylist, removePlaylist } =
    usePlaylistStore();
  const router = useRouter();
  const utils = trpc.useUtils();
  const handleUpdate = async () => {};
  const { mutate: deletePlaylist } = trpc.playlists.deletePlaylist.useMutation({
    onSuccess: async (data, variables) => {
      removePlaylist(variables.playlistId);
      alert(data.success);
    },
  });
  const { data: playlists } = trpc.playlists.getPlaylists.useQuery();

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
            <div className='flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500'>
              <span className='text-lg font-bold text-white'>TV</span>
            </div>
            <span className='text-xl font-bold text-white'>StreamMax</span>
          </Link>
          <div className='items-center hidden space-x-4 md:flex'>
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
              <Button
                className='cursor-pointer'
                variant='ghost'
                size='icon'
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  deletePlaylist({ playlistId: selectedPlaylist!.id });
                }}
              >
                <Trash2 className='w-5 h-5 text-red-400 ' />
              </Button>
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
            <Button
              variant={"outline"}
              className='cursor-pointer'
              onClick={() => quitApp()}
            >
              <LogOutIcon width={10} height={10} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
