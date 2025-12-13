import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cleanName = (name: string) => {
  return name
    .replace(/^[A-Z]{2}\s*-\s*/g, '')
    .replace(/^[^-\-]+[-–]\s*/g, '')
    .replace(/^[A-Z]{2}\s*-\s*/i, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
};

// helper to decode base64 safely
export const decodeBase64 = (str: string) => {
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
  } catch {
    return str;
  }
};

// progress calculation
export const getProgress = (start: string, end: string) => {
  const now = Date.now();
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (now < startMs) return 0;
  if (now > endMs) return 100;
  return ((now - startMs) / (endMs - startMs)) * 100;
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  if (typeof duration === 'string') {
    return duration;
  }

  if (typeof duration === 'number') {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  return null;
};

export const getVideoType = (url: string): string => {
  if (url.includes('.m3u8') || url.includes('m3u8')) {
    return 'application/x-mpegURL'; // HLS
  } else if (url.includes('.mpd')) {
    return 'application/dash+xml'; // DASH
  } else if (url.includes('.mp4')) {
    return 'video/mp4';
  } else if (url.includes('.webm')) {
    return 'video/webm';
  } else if (url.includes('.ogg')) {
    return 'video/ogg';
  }
  return 'video/mp4'; // default
};
