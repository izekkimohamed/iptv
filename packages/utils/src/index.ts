export const cleanName = (name: string) => {
  return name
    .replace(/^.*[|-]\s/i, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[()]/g, "")
    .trim();
};

// helper to decode base64 safely
export const decodeBase64 = (str: string) => {
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return str;
  }
};

// progress calculation
export const getProgress = (start: string, end: string) => {
  const now = new Date().getTime();
  // Replace space with 'T' for ISO compatibility if needed, or parse directly
  const startMs = new Date(start.replace(" ", "T")).getTime();
  const endMs = new Date(end.replace(" ", "T")).getTime();

  if (now < startMs) return 0;
  if (now > endMs) return 100;

  const total = endMs - startMs;
  const current = now - startMs;
  return Math.round((current / total) * 100);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const formatDuration = (duration: string | number | undefined) => {
  if (!duration) return null;

  if (typeof duration === "string") {
    return duration;
  }

  if (typeof duration === "number") {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  return null;
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const getVideoType = (url: string): string => {
  if (url.includes(".m3u8") || url.includes("m3u8")) {
    return "application/x-mpegURL"; // HLS
  } else if (url.includes(".mpd")) {
    return "application/dash+xml"; // DASH
  } else if (url.includes(".mp4")) {
    return "video/mp4";
  } else if (url.includes(".webm")) {
    return "video/webm";
  } else if (url.includes(".ogg")) {
    return "video/ogg";
  }
  return "video/mp4"; // default
};

// utils/dateHelpers.ts
export const formatDateForAPI = (date: Date): string => {
  return date.toLocaleDateString("en-GB"); // Returns DD/MM/YYYY
};

export const formatDisplayDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};
