'use client';
import useSWR from 'swr';

// Import your types here if they are in a separate file
import { Game } from '@/trpc/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MatchCenter({ gameId, onClose }: { gameId: number; onClose: () => void }) {
  // Use the specific endpoint we discussed
  const {
    data: game,
    error,
    isLoading,
  } = useSWR<Game>(
    gameId ? `${process.env.NEXT_PUBLIC_API_URL}/match-details?id=${gameId}` : null,
    fetcher,
  );

  if (error) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="animate-in fade-in absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />

      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[40px] border border-white/10 bg-[#0c0c0c] shadow-2xl">
        {isLoading || !game ? (
          <div className="flex justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-green-500" />
          </div>
        ) : (
          <>
            {/* --- HEADER: SCORE & TEAMS --- */}
            <div className="border-b border-white/5 bg-white/[0.02] p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${game.homeCompetitor.id}`}
                    className="mx-auto mb-3 h-16 w-16"
                  />
                  <div className="text-sm font-black text-white uppercase">
                    {game.homeCompetitor.name}
                  </div>
                </div>

                <div className="px-6 text-center">
                  <div className="text-5xl font-black tracking-tighter text-white">
                    {game.homeCompetitor.score} - {game.awayCompetitor.score}
                  </div>
                  <div className="mt-3 inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-[10px] font-black tracking-widest text-green-400 uppercase">
                    {game.gameTimeDisplay || game.statusText}
                  </div>
                </div>

                <div className="flex-1 text-center">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${game.awayCompetitor.id}`}
                    className="mx-auto mb-3 h-16 w-16"
                  />
                  <div className="text-sm font-black text-white uppercase">
                    {game.awayCompetitor.name}
                  </div>
                </div>
              </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="no-scrollbar flex-1 space-y-10 overflow-y-auto p-6">
              {/* TIMELINE SECTION (Using Game.events) */}
              <section>
                <h3 className="mb-6 text-center text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">
                  Match Timeline
                </h3>
                <div className="space-y-4">
                  {game.events
                    ?.sort((a, b) => b.order - a.order)
                    .map((event, i) => {
                      const isHome = event.competitorId === game.homeCompetitor.id;
                      // Find player name from game.members
                      const player = game.members?.find((m) => m.id === event.playerId);

                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-4 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          <div className="w-10 text-[10px] font-black text-white/20">
                            {event.gameTimeDisplay}
                          </div>
                          <div
                            className={`flex-1 rounded-2xl border border-white/5 p-3 ${isHome ? 'bg-white/5' : 'bg-green-500/5'}`}
                          >
                            <div
                              className={`text-xs font-bold ${isHome ? 'text-white' : 'text-green-400'}`}
                            >
                              {player?.shortName || 'Player'}
                            </div>
                            <div className="mt-0.5 text-[9px] font-black text-white/40 uppercase">
                              {event.eventType.name}{' '}
                              {event.eventType.subTypeName
                                ? `(${event.eventType.subTypeName})`
                                : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* LINEUPS / STATS (Using homeCompetitor.lineups) */}
              {game.homeCompetitor.lineups && (
                <section>
                  <h3 className="mb-6 text-center text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">
                    Top Performers
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[game.homeCompetitor, game.awayCompetitor].map((comp, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="mb-3 text-[9px] font-bold text-white/40 uppercase">
                          {comp.name} Formation: {comp.lineups?.formation}
                        </div>
                        {comp.lineups?.members?.slice(0, 3).map((member, mIdx) => (
                          <div
                            key={mIdx}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3"
                          >
                            <span className="text-xs font-medium text-white/80">
                              {member.statusText}
                            </span>
                            <div className="flex gap-2">
                              {member.stats
                                ?.filter((s) => s.isTop)
                                .map((s, sIdx) => (
                                  <span key={sIdx} className="text-[10px] font-bold text-green-400">
                                    {s.value} {s.shortName}
                                  </span>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
