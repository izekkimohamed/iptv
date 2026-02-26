'use client';

import InstallationOverlay from '@/shared/components/settings/InstallationOverlay';
import PlaylistForm from '@/shared/components/settings/PlaylistForm';
import PlaylistManager from '@/shared/components/settings/PlaylistManager';
import { SettingsHeader } from '@/shared/components/settings/SettingsHeader';
import { trpc } from '@/shared/lib/trpc';
import { usePlaylistCreation, CreationStage } from '@/shared/hooks/usePlaylistCreation';
import { usePlaylistForm } from '@repo/hooks';
import { usePlaylistStore } from '@repo/store';
import { toast } from 'sonner';

export { CreationStage };

export default function PlaylistSettingsPage() {
  const {
    selectedPlaylist,
    selectPlaylist,
    isCreatingPlaylist,
    finishPlaylistCreation,
    removePlaylist,
    playlists: storedPlaylists,
  } = usePlaylistStore();

  const { currentStage, totalProgress, isUpdating, handleUpdate } = usePlaylistCreation({
    selectedPlaylist,
    isCreatingPlaylist,
    finishPlaylistCreation,
  });

  const utils = trpc.useUtils();
  const { mutate: deletePlaylist, isPending: deletePending } =
    trpc.playlists.deletePlaylist.useMutation({
      onSuccess: async (_data, variables) => {
        await utils.playlists.getPlaylists.invalidate();
        removePlaylist(variables.playlistId);
        if (storedPlaylists.length) {
          selectPlaylist(storedPlaylists[0]);
        }
        toast.success('Node removed successfully');
      },
    });

  const {
    formData,
    setFormData,
    isPending: isVerifying,
    handleSubmit,
    isFormValid,
    urlError,
    urlTouched,
    setUrlTouched,
    urlStatus,
  } = usePlaylistForm(trpc);

  const { data: playlists } = trpc.playlists.getPlaylists.useQuery();

  return (
    <div className="h-full overflow-y-auto px-6 py-12 text-neutral-100">
      {(isCreatingPlaylist || isUpdating) && (
        <InstallationOverlay
          currentStage={currentStage}
          totalProgress={totalProgress}
          isUpdating={isUpdating}
        />
      )}

      <div className="mx-auto max-w-7xl space-y-12">
        <SettingsHeader />

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <PlaylistForm
                formData={formData}
                setFormData={setFormData}
                isVerifying={isVerifying}
                handleSubmit={handleSubmit}
                isFormValid={isFormValid}
                urlError={urlError}
                urlTouched={urlTouched}
                setUrlTouched={setUrlTouched}
                urlStatus={urlStatus}
              />
            </div>
          </div>

          {playlists && selectedPlaylist && (
            <div className="lg:col-span-7">
              <PlaylistManager
                playlists={playlists}
                selectedPlaylist={selectedPlaylist}
                selectPlaylist={selectPlaylist}
                handleUpdate={handleUpdate}
                deletePlaylist={deletePlaylist}
                deletePending={deletePending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
