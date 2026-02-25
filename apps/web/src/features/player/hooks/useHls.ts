import Hls from 'hls.js';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

function isHlsSrc(src: string) {
  return src.includes('.m3u8') || src.includes('.ts');
}

export interface QualityLevel {
  index: number;
  height?: number;
  bitrate?: number;
  label: string;
}

export function useHls(
  videoRef: RefObject<HTMLVideoElement | null>,
  src: string,
  autoPlay: boolean,
  onError: (msg: string, code: number) => void,
) {
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const hlsRef = { current: null as Hls | null };
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const setQuality = useCallback((index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentQuality(index);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (isHlsSrc(src)) {
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, startPosition: -1 });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels: QualityLevel[] = hls!.levels.map((level, index) => ({
            index,
            height: level.height,
            bitrate: level.bitrate,
            label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}kbps`,
          }));

          setQualityLevels([{ index: -1, label: 'Auto' }, ...levels]);
          setCurrentQuality(-1);

          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          setCurrentQuality(data.level);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            onErrorRef.current(data.details, data.type === Hls.ErrorTypes.NETWORK_ERROR ? 2 : 3);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        if (autoPlay) video.play().catch(() => {});
      } else {
        onErrorRef.current('HLS is not supported in this browser.', 4);
      }
    } else {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      hls?.destroy();
      hlsRef.current = null;
    };
  }, [src, autoPlay, videoRef]);

  return { qualityLevels, currentQuality, setQuality };
}
