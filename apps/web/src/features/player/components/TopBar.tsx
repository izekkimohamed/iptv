export default function TopBar({
  title,
  episodeNumber,
  totalEpisodes,
  seasonId,
  showControls,
}: {
  title?: string;
  episodeNumber?: number;
  totalEpisodes?: number;
  seasonId?: number;
  showControls: boolean;
}) {
  return (
    <div
      style={{
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s',
        padding: '20px 24px 60px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
        pointerEvents: showControls ? 'auto' : 'none',
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Top bar"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {title && (
          <span
            style={{
              fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
              fontSize: 22,
              letterSpacing: 2,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            {title}
          </span>
        )}

        {episodeNumber != null && (
          <span
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              padding: '2px 10px',
              fontSize: 12,
              letterSpacing: 1,
              color: 'rgba(255,255,255,0.85)',
              fontFamily: 'monospace',
            }}
          >
            {seasonId != null ? `S${seasonId} · ` : ''}E{episodeNumber}
          </span>
        )}
      </div>
    </div>
  );
}
