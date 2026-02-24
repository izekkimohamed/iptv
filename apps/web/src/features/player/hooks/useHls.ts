import Hls from 'hls.js';
import { RefObject, useEffect } from 'react';

function isHlsSrc(src: string) {
  return src.includes('.m3u8') || src.includes('.ts');
}

export function useHls(
  videoRef: RefObject<HTMLVideoElement | null>,
  src: string,
  autoPlay: boolean,
  onError: (msg: string, code: number) => void,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (isHlsSrc(src)) {
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            onError(data.details, data.type === Hls.ErrorTypes.NETWORK_ERROR ? 2 : 3);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = src;
        if (autoPlay) video.play().catch(() => {});
      } else {
        onError('HLS is not supported in this browser.', 4);
      }
    } else {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      hls?.destroy();
    };
  }, [src, autoPlay, videoRef, onError]);
}
