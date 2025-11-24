import { useEffect, useRef, useState } from "react";

export default function VideoJSPlayer({ videoUrl }) {
  const videoRef = useRef(null);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoUrl) return;

    const video = videoRef.current;

    // Direct video URL
    video.src = videoUrl;

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded");

      // Check for audio tracks (if supported by browser)
      if (video.audioTracks && video.audioTracks.length > 0) {
        const tracks = Array.from(video.audioTracks).map((track, index) => ({
          id: track.id,
          label: track.label || `Audio Track ${index + 1}`,
          language: track.language,
          enabled: track.enabled,
          index: index,
        }));

        console.log("Available audio tracks:", tracks);
        setAudioTracks(tracks);

        // Try to enable a compatible track
        // Prefer AC-3, AAC, or MP3 tracks
        const compatibleTrack = tracks.find(
          (t) =>
            t.label.toLowerCase().includes("ac-3") ||
            t.label.toLowerCase().includes("ac3") ||
            t.label.toLowerCase().includes("aac") ||
            t.label.toLowerCase().includes("mp3")
        );

        if (compatibleTrack) {
          console.log("Found compatible track:", compatibleTrack);
          selectAudioTrack(compatibleTrack.index);
        }
      }

      setLoading(false);
    };

    const handleCanPlay = () => {
      console.log("Video can play");
      setLoading(false);
      setError(null);
    };

    const handleError = (e) => {
      console.error("Video error:", e);
      const err = video.error;

      if (err) {
        let errorMessage = "Failed to load video";

        switch (err.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Video loading aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error while loading video";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage =
              "Video format not supported by browser. HEVC/H.265 requires Safari or Edge.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Video format or codec not supported";
            break;
        }

        setError(errorMessage);
      }

      setLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [videoUrl]);

  const selectAudioTrack = (trackIndex) => {
    const video = videoRef.current;

    if (video.audioTracks && video.audioTracks.length > 0) {
      // Disable all tracks
      for (let i = 0; i < video.audioTracks.length; i++) {
        video.audioTracks[i].enabled = false;
      }

      // Enable selected track
      if (video.audioTracks[trackIndex]) {
        video.audioTracks[trackIndex].enabled = true;
        setSelectedTrack(trackIndex);
        console.log("Switched to audio track:", trackIndex);
      }
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto p-4'>
      <div className='bg-black rounded-lg overflow-hidden shadow-2xl relative'>
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10'>
            <div className='text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4'></div>
              <div className='text-white text-lg'>Loading video...</div>
            </div>
          </div>
        )}

        {error && (
          <div className='absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90 z-10'>
            <div className='text-white p-6 text-center max-w-md'>
              <div className='text-5xl mb-4'>⚠️</div>
              <div className='font-bold text-xl mb-3'>Playback Error</div>
              <div className='text-sm mb-4'>{error}</div>

              {error.includes("HEVC") && (
                <div className='bg-red-800 bg-opacity-50 p-4 rounded text-xs text-left mb-4'>
                  <p className='font-semibold mb-2'>
                    HEVC/H.265 Video Detected
                  </p>
                  <p>This video uses HEVC codec which is only supported in:</p>
                  <ul className='list-disc list-inside mt-2 space-y-1'>
                    <li>Safari (macOS/iOS)</li>
                    <li>Edge (with HEVC extension)</li>
                  </ul>
                  <p className='mt-2'>
                    Chrome and Firefox don't support HEVC playback.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  videoRef.current.load();
                }}
                className='px-6 py-2 bg-white text-red-900 rounded-lg hover:bg-gray-200 transition-colors font-semibold'
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          className='w-full'
          playsInline
          style={{ maxHeight: "70vh" }}
        >
          Your browser does not support video playback.
        </video>
      </div>

      {/* Audio Track Selector */}
      {audioTracks.length > 0 && (
        <div className='mt-4 p-4 bg-gray-100 rounded-lg'>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>
            Audio Track:
          </label>
          <select
            value={selectedTrack ?? ""}
            onChange={(e) => selectAudioTrack(parseInt(e.target.value))}
            className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            {audioTracks.map((track) => (
              <option key={track.index} value={track.index}>
                {track.label} {track.language ? `(${track.language})` : ""}
              </option>
            ))}
          </select>
          <p className='text-xs text-gray-600 mt-2'>
            If you don't hear audio, try selecting a different track above.
          </p>
        </div>
      )}

      {/* Browser Compatibility Info */}
      <div className='mt-4 p-4 bg-blue-50 rounded-lg text-sm'>
        <p className='font-semibold text-blue-900 mb-2'>
          📌 Browser Compatibility:
        </p>
        <ul className='text-blue-800 space-y-1 text-xs'>
          <li>
            • <strong>HEVC/H.265 video:</strong> Only Safari and Edge (with
            extension)
          </li>
          <li>
            • <strong>H.264 video:</strong> All modern browsers
          </li>
          <li>
            • <strong>TrueHD Atmos audio:</strong> Not supported (will fall back
            to AC-3 or AAC)
          </li>
          <li>
            • <strong>AC-3/AAC audio:</strong> Supported in most browsers
          </li>
        </ul>
      </div>

      {/* Technical Details */}
      <details className='mt-4'>
        <summary className='cursor-pointer text-sm text-gray-600 hover:text-gray-900'>
          Technical Details
        </summary>
        <div className='mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 font-mono'>
          <p>
            <strong>Video Source:</strong> {videoUrl}
          </p>
          <p>
            <strong>Audio Tracks Found:</strong> {audioTracks.length}
          </p>
          <p>
            <strong>Browser:</strong>{" "}
            {(
              navigator.userAgent.includes("Safari") &&
              !navigator.userAgent.includes("Chrome")
            ) ?
              "Safari (HEVC supported)"
            : navigator.userAgent.includes("Edg") ?
              "Edge"
            : "Chrome/Firefox (HEVC NOT supported)"}
          </p>
        </div>
      </details>
    </div>
  );
}
