import { useEffect, useRef, useState, useCallback } from "react";
import Hls, {
  ErrorData,
  Events,
  ErrorTypes,
  FragLoadedData,
  LevelSwitchedData,
} from "hls.js";

interface UseVideoProps {
  src: string;
  autoPlay?: boolean;
}

export const useVideoSource = ({ src, autoPlay = true }: UseVideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const bandwidthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBytesRef = useRef(0);
  const lastTimeRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bandwidth
  const [totalBytes, setTotalBytes] = useState(0);
  const [bandwidth, setBandwidth] = useState(0);

  // Resolution
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Native video bandwidth estimation
  const estimateNativeBandwidth = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      // Method 1: Use getVideoPlaybackQuality if available
      // if ("getVideoPlaybackQuality" in video) {
      //   const quality = (video as any).getVideoPlaybackQuality();
      //   if (quality && quality.totalVideoFrames > 0) {
      //     // Estimate based on video quality metrics
      //     const currentTime = performance.now();
      //     const timeDiff = currentTime - lastTimeRef.current;

      //     if (timeDiff > 1000 && lastTimeRef.current > 0) {
      //       // Rough bandwidth estimation based on video properties
      //       const videoWidth = video.videoWidth || 1920;
      //       const videoHeight = video.videoHeight || 1080;
      //       const fps = 30; // Assume 30fps as default

      //       // Rough calculation: pixels per second * bits per pixel
      //       const pixelsPerSecond = videoWidth * videoHeight * fps;
      //       const estimatedBitrate = pixelsPerSecond * 0.5; // Rough compression factor

      //       setBandwidth(estimatedBitrate);
      //       lastTimeRef.current = currentTime;
      //     }
      //   }
      // }

      // Method 2: Use NetworkInformation API if available
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        if (connection && connection.downlink) {
          // Convert Mbps to bps
          console.log("bandwidth:", connection.downlink);

          setBandwidth(connection.downlink * 100000);
        }
      }
    } catch (error) {
      console.log("Error estimating bandwidth:", error);
    }
  }, []);

  // Update resolution for native video
  const updateNativeResolution = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.videoWidth && video.videoHeight) {
      setResolution({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    }
  }, []);

  // Setup native video listeners
  const setupNativeVideoListeners = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      updateNativeResolution();
      setIsLoading(false);
    };

    const handleResize = () => {
      updateNativeResolution();
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const currentTime = video.currentTime;
        const bufferedBytes = bufferedEnd * 1000000; // Rough estimation
        setTotalBytes(bufferedBytes);
      }
      estimateNativeBandwidth();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleError = () => {
      setError("Failed to load video");
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      updateNativeResolution();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("resize", handleResize);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("error", handleError);
    video.addEventListener("canplay", handleCanPlay);

    // Start bandwidth estimation interval for native video
    bandwidthIntervalRef.current = setInterval(() => {
      estimateNativeBandwidth();
    }, 2000);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("resize", handleResize);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("error", handleError);
      video.removeEventListener("canplay", handleCanPlay);

      if (bandwidthIntervalRef.current) {
        clearInterval(bandwidthIntervalRef.current);
        bandwidthIntervalRef.current = null;
      }
    };
  }, [estimateNativeBandwidth, updateNativeResolution]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let isMounted = true;
    let cleanupNative: (() => void) | undefined;

    const isHLS = src.endsWith(".m3u8");

    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);
      setTotalBytes(0);
      setBandwidth(0);
      setResolution(null);

      try {
        if (isHLS) {
          // Try HLS
          const { default: HlsLib } = await import("hls.js");

          if (HlsLib.isSupported()) {
            // Clean up old instance
            if (hlsRef.current) {
              hlsRef.current.destroy();
              hlsRef.current = null;
            }

            const hls = new HlsLib({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
              maxBufferLength: 30,
              maxMaxBufferLength: 600,
            });

            hlsRef.current = hls;

            hls.on(Events.MEDIA_ATTACHED, () => {
              console.log("HLS: Media attached");
            });

            hls.on(Events.MANIFEST_PARSED, (event, data) => {
              console.log("HLS: Manifest parsed", data);
              if (isMounted) setIsLoading(false);

              // Set initial resolution from first level
              if (data.levels && data.levels.length > 0) {
                console.log("HLS: Setting initial resolution", data.levels);

                const firstLevel = data.levels[0];
                if (firstLevel.width && firstLevel.height) {
                  setResolution({
                    width: firstLevel.width,
                    height: firstLevel.height,
                  });
                }
              }

              if (autoPlay) video.play().catch(() => {});
            });

            // --- Bandwidth tracking for HLS ---
            hls.on(Events.FRAG_LOADED, (_event, data: FragLoadedData) => {
              try {
                const frag = data.frag;
                const stats = frag.stats;

                if (stats && stats.loading) {
                  const loadingStats = stats.loading;
                  const bytes = stats.total || 0;

                  if (loadingStats.first && loadingStats.end && bytes > 0) {
                    const loadTimeMs = loadingStats.end - loadingStats.first;
                    if (loadTimeMs > 0) {
                      const bitrate = (bytes * 8) / (loadTimeMs / 1000);
                      setTotalBytes((prev) => prev + bytes);
                      setBandwidth(Math.round(bitrate));
                    }
                  }
                }

                // Alternative method using fragment duration
                if (frag.duration && frag.stats?.total) {
                  const bytes = frag.stats.total;
                  const durationSeconds = frag.duration;
                  const bitrate = (bytes * 8) / durationSeconds;
                  setBandwidth(Math.round(bitrate));
                }
              } catch (error) {
                console.log("Error calculating bandwidth:", error);
              }
            });

            // --- Resolution tracking for HLS ---
            hls.on(Events.LEVEL_SWITCHED, (_event, data: LevelSwitchedData) => {
              try {
                const level = hls.levels[data.level];
                if (level && level.width && level.height) {
                  setResolution({
                    width: level.width,
                    height: level.height,
                  });
                  console.log(
                    `HLS: Switched to ${level.width}x${level.height}`
                  );
                }
              } catch (error) {
                console.log("Error getting resolution:", error);
              }
            });

            // Also listen for level updates
            hls.on(Events.LEVEL_UPDATED, (_event, data) => {
              try {
                const level = hls.levels[data.level];
                if (level && level.width && level.height) {
                  setResolution({
                    width: level.width,
                    height: level.height,
                  });
                }
              } catch (error) {
                console.log("Error updating resolution:", error);
              }
            });

            hls.on(Events.ERROR, (_event: string, data: ErrorData) => {
              console.log("HLS Error:", data);
              if (!isMounted) return;

              if (data.fatal) {
                setError(`HLS Error: ${data.details}`);
                setIsLoading(false);

                switch (data.type) {
                  case ErrorTypes.NETWORK_ERROR:
                    console.log("Network error, trying to recover...");
                    hls.startLoad();
                    break;
                  case ErrorTypes.MEDIA_ERROR:
                    console.log("Media error, trying to recover...");
                    hls.recoverMediaError();
                    break;
                  default:
                    console.log("Fatal error, cannot recover");
                    hls.destroy();
                    hlsRef.current = null;
                    break;
                }
              }
            });

            hls.attachMedia(video);
            hls.loadSource(src);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari native HLS - setup native listeners
            video.src = src;
            cleanupNative = setupNativeVideoListeners();
            if (autoPlay) video.play().catch(() => {});
          } else {
            if (isMounted) setError("HLS is not supported in this browser");
            if (isMounted) setIsLoading(false);
          }
        } else {
          // Non-HLS (mp4, mkv, avi, webm, etc.)
          video.src = src;
          cleanupNative = setupNativeVideoListeners();
          if (autoPlay) video.play().catch(() => {});
        }
      } catch (err) {
        console.log("Failed to load video:", err);
        if (isMounted) setError("Failed to load video player");
        if (isMounted) setIsLoading(false);
      }
    };

    loadVideo();

    return () => {
      isMounted = false;

      // Cleanup HLS
      if (hlsRef.current) {
        const hls = hlsRef.current;
        hls.off(Events.MEDIA_ATTACHED);
        hls.off(Events.MANIFEST_PARSED);
        hls.off(Events.FRAG_LOADED);
        hls.off(Events.LEVEL_SWITCHED);
        hls.off(Events.LEVEL_UPDATED);
        hls.off(Events.ERROR);
        hls.destroy();
        hlsRef.current = null;
      }

      // Cleanup native video listeners
      if (cleanupNative) {
        cleanupNative();
      }

      // Cleanup bandwidth interval
      if (bandwidthIntervalRef.current) {
        clearInterval(bandwidthIntervalRef.current);
        bandwidthIntervalRef.current = null;
      }
    };
  }, [src, autoPlay, setupNativeVideoListeners]);

  return {
    videoRef,
    isLoading,
    error,
    setError,
    totalBytes,
    bandwidth,
    resolution,
  };
};
