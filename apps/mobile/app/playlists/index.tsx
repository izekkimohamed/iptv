import PlaylistLoginForm from "@/components/PlaylistForm";
import PlaylistSetupScreen from "@/components/PlaylistSetup";
import { usePlaylistStore } from "@/store/appStore";
import React from "react";

export default function PlaylistAuthScreen() {
  const { isCreatingPlaylist } = usePlaylistStore();

  return isCreatingPlaylist ? <PlaylistSetupScreen /> : <PlaylistLoginForm />;
}
