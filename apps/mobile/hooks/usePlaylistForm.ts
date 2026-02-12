import { usePlaylistStore } from "@/store";
import { useEffect, useState } from "react";

export const usePlaylistForm = (trpc: any) => {
  const [formData, setFormData] = useState({
    url: "",
    username: "",
    password: "",
  });

  const [urlTouched, setUrlTouched] = useState(false);
  const [urlStatus, setUrlStatus] = useState<"" | "checking" | "verified">("");
  const [urlError, setUrlError] = useState("");

  const { addPlaylist, selectPlaylist, startPlaylistCreation } =
    usePlaylistStore();

  const {
    mutate: createPlaylist,
    isPending,
    error,
  } = trpc.playlists.createPlaylist.useMutation({
    onSuccess: (data: any) => {
      if (!data) return;
      setUrlStatus("");
      setFormData({ url: "", username: "", password: "" });
      addPlaylist(data);
      selectPlaylist(data);
      startPlaylistCreation();
    },
  });

  const validateUrl = (url: string) => {
    if (!url) return "";
    try {
      new URL(url);
      return url.startsWith("https://") || url.startsWith("http://") ?
          ""
        : "Secure connection (HTTPS) recommended";
    } catch {
      return "Invalid server URL";
    }
  };

  useEffect(() => {
    const err = validateUrl(formData.url);
    setUrlError(err);

    if (formData.url && !err) {
      setUrlStatus("checking");
      const timer = setTimeout(() => setUrlStatus("verified"), 800); // Simulate check
      return () => clearTimeout(timer);
    } else {
      setUrlStatus("");
    }
  }, [formData.url]);

  const handleSubmit = () => {
    if (isFormValid) {
      createPlaylist(formData);
    }
  };

  const isFormValid =
    formData.url && formData.username && formData.password && !urlError;

  return {
    formData,
    setFormData,
    urlTouched,
    setUrlTouched,
    urlStatus,
    setUrlStatus,
    urlError,
    setUrlError,
    createPlaylist,
    isPending,
    error,
    handleSubmit,
    isFormValid,
    validateUrl,
  };
};
