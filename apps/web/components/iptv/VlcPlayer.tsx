"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-http-source-selector/dist/videojs-http-source-selector.css";
import "videojs-hotkeys";

interface VlcPlayerProps {
  src: string;
  poster?: string;
  subtitles?: {
    src: string;
    kind: "subtitles";
    srclang: string;
    label: string;
  }[];
}

export default function VlcPlayer({ src, poster, subtitles }: VlcPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<videojs.Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: "auto",
      fluid: true,
      poster,
    });

    // Add multiple sources
    player.src(src);

    // Add subtitles
    subtitles?.forEach((sub) => player.addRemoteTextTrack(sub, false));

    // Enable quality selector
    player.ready(() => {
      if (player.videoJsResolutionSwitcher) {
        // plugin already initialized if using videojs-http-source-selector
      }
    });

    // Optional: enable hotkeys
    player.hotkeys({
      volumeStep: 0.1,
      seekStep: 5,
      enableModifiersForNumbers: false,
    });

    playerRef.current = player;

    return () => {
      player.dispose();
    };
  }, [src, subtitles, poster]);

  return (
    <div>
      <div data-vjs-player>
        <video ref={videoRef} className='video-js vjs-big-play-centered' />
      </div>
    </div>
  );
}
