import { AlertCircle } from 'lucide-react';

interface PlayerErrorStateProps {
  playbackError: { message: string; code: number };
  setPlaybackError: (error: { message: string; code: number } | null) => void;
}

export function PlayerErrorState({ playbackError, setPlaybackError }: PlayerErrorStateProps) {
  let title_ = 'Playback error';
  let detail = playbackError.message;

  if (playbackError.code === 2) {
    title_ = 'Network Error';
    detail = 'Could not load the media. Please check your connection.';
  } else if (playbackError.message?.includes('405')) {
    title_ = 'Access Denied (405)';
    detail = 'The server rejected this stream. The link may be invalid or expired.';
  }

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', width: '100%', background: 'rgba(0,0,0,0.85)', borderRadius: 12,
        padding: 32, gap: 16, color: '#fff', fontFamily: 'system-ui, sans-serif',
      }}
    >
      <AlertCircle size={48} />
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title_}</h2>
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 400 }}>
        {detail}
      </p>
      <button
        onClick={() => setPlaybackError(null)}
        style={{
          marginTop: 8, padding: '10px 28px', borderRadius: 99,
          border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)',
          color: '#fff', cursor: 'pointer', fontSize: 14, transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)')}
      >
        Try Again
      </button>
    </div>
  );
}
