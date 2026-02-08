'use client';

import { CheckCircle2, Layers, LayoutGrid, Play, RefreshCw, Server, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Playlist {
  id: number;
  baseUrl: string;
  username: string;
  password: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  expDate: string;
  status: string;
  isTrial: string;
}
interface PlaylistProps {
  playlists: Playlist[];
  selectedPlaylist: Playlist;
  deletePending: boolean;
  handleUpdate: () => void;
  deletePlaylist: ({ playlistId }: { playlistId: number }) => void;
  selectPlaylist: (playlist: Playlist) => void;
}

const PlaylistManager = ({
  playlists,
  selectedPlaylist,
  selectPlaylist,
  handleUpdate,
  deletePlaylist,
  deletePending,
}: PlaylistProps) => {
  return (
    <div className="space-y-6">
      {/* Active Node Card */}
      <div className="group relative overflow-hidden rounded-sm border border-slate-500/10 bg-linear-to-br from-neutral-100/10 to-neutral-100/5 p-6">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />

        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="mb-1 flex items-center gap-2 text-primary">
              <Server className="h-4 w-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Active Playlist</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {selectedPlaylist ? selectedPlaylist.username : 'No Active Node'}
            </h3>
            <p className="max-w-62.5 truncate text-xs text-neutral-400">
              {selectedPlaylist ? selectedPlaylist.baseUrl : 'Select a source below'}
            </p>
          </div>

          <div className="flex gap-2">
            {selectedPlaylist && (
              <Button
                onClick={() => handleUpdate()}
                variant="outline"
                className="h-10 rounded-sm border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Update
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between px-1">
        <h4 className="flex items-center gap-2 text-sm font-medium text-neutral-300">
          <LayoutGrid className="h-4 w-4 text-neutral-500" />
          Available Playlists
        </h4>
        <Badge variant="outline" className="border-white/10 bg-white/5 text-neutral-400">
          {playlists?.length || 0} Total
        </Badge>
      </div>

      {/* Node List */}
      <div className="space-y-3">
        {playlists?.map((p) => {
          const isActive = selectedPlaylist?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => selectPlaylist(p)}
              className={cn(
                'group relative flex cursor-pointer items-center justify-between rounded-sm border p-4 transition-all duration-300',
                isActive
                  ? 'border-slate-500/50 bg-slate-500/5'
                  : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/4',
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700 group-hover:text-neutral-300',
                  )}
                >
                  {isActive ? (
                    <Play className="h-4 w-4 fill-current" />
                  ) : (
                    <Layers className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isActive ? 'text-primary' : 'text-neutral-300',
                      )}
                    >
                      {p.username}
                    </span>
                    {isActive && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  </div>
                  <div className="max-w-50 truncate font-mono text-[11px] text-neutral-500">
                    {new URL(p.baseUrl).hostname}
                  </div>
                  <div className="max-w-50 truncate font-mono text-[11px] text-neutral-500">
                    {new Date(p.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist({ playlistId: p.id });
                  }}
                  variant={'ghost'}
                  disabled={deletePending}
                  className="cursor-pointer border border-red-500/30 bg-red-500/5 text-red-500 transition-all duration-350 ease-in-out hover:bg-red-500 hover:text-red-50 focus:bg-red-500/10 focus:text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaylistManager;
