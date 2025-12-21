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
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {isLoading || !game ? (
          <div className="p-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
          </div>
        ) : (
          <>
            {/* --- HEADER: SCORE & TEAMS --- */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${game.homeCompetitor.id}`}
                    className="w-16 h-16 mx-auto mb-3"
                  />
                  <div className="font-black text-white text-sm uppercase">
                    {game.homeCompetitor.name}
                  </div>
                </div>

                <div className="text-center px-6">
                  <div className="text-5xl font-black tracking-tighter text-white">
                    {game.homeCompetitor.score} - {game.awayCompetitor.score}
                  </div>
                  <div className="text-[10px] font-black text-green-400 mt-3 uppercase tracking-widest bg-green-500/10 px-4 py-1.5 rounded-full inline-block">
                    {game.gameTimeDisplay || game.statusText}
                  </div>
                </div>

                <div className="text-center flex-1">
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${game.awayCompetitor.id}`}
                    className="w-16 h-16 mx-auto mb-3"
                  />
                  <div className="font-black text-white text-sm uppercase">
                    {game.awayCompetitor.name}
                  </div>
                </div>
              </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
              {/* TIMELINE SECTION (Using Game.events) */}
              <section>
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 text-center">
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
                          <div className="text-[10px] font-black text-white/20 w-10">
                            {event.gameTimeDisplay}
                          </div>
                          <div
                            className={`flex-1 p-3 rounded-2xl border border-white/5 ${isHome ? 'bg-white/5' : 'bg-green-500/5'}`}
                          >
                            <div
                              className={`text-xs font-bold ${isHome ? 'text-white' : 'text-green-400'}`}
                            >
                              {player?.shortName || 'Player'}
                            </div>
                            <div className="text-[9px] text-white/40 uppercase font-black mt-0.5">
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
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 text-center">
                    Top Performers
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[game.homeCompetitor, game.awayCompetitor].map((comp, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="text-[9px] font-bold text-white/40 uppercase mb-3">
                          {comp.name} Formation: {comp.lineups?.formation}
                        </div>
                        {comp.lineups?.members?.slice(0, 3).map((member, mIdx) => (
                          <div
                            key={mIdx}
                            className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex justify-between items-center"
                          >
                            <span className="text-xs text-white/80 font-medium">
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
