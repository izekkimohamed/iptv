import { Game } from '@/trpc/types';
import { useEffect, useRef, useState } from 'react';
import { GoalPopup } from './Goal';
import { MatchCenter } from './MatchCenter';

interface MatchCardProps {
  game: Game;
  priority?: boolean;
}

export function MatchCard({ game, priority = false }: MatchCardProps) {
  const [showGoalPopup, setShowGoalPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isLive = game.statusGroup === 3;
  const isFinished = game.statusGroup === 4;
  const isScheduled = game.statusGroup === 2;

  const currentTotalScore = game.homeCompetitor.score + game.awayCompetitor.score;
  const prevScoreRef = useRef(currentTotalScore);

  useEffect(() => {
    if (isLive && currentTotalScore > prevScoreRef.current) {
      setShowGoalPopup(true);
      const timer = setTimeout(() => setShowGoalPopup(false), 8000);
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = currentTotalScore;
  }, [currentTotalScore, isLive]);

  const progressPercent = Math.min((game.gameTime / 90) * 100, 100);
  const homeWinning = game.homeCompetitor.score > game.awayCompetitor.score;
  const awayWinning = game.awayCompetitor.score > game.homeCompetitor.score;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`group relative flex w-[340px] shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-3xl border transition-all duration-500 ${
          showGoalPopup
            ? 'z-50 scale-[1.02] border-primary shadow-[0_0_40px_rgba(var(--primary),0.3)]'
            : isLive
              ? 'border-white/20 bg-linear-to-br from-white/10 to-transparent shadow-2xl backdrop-blur-xl'
              : 'border-white/10 bg-white/3'
        }`}
      >
        {/* --- GOAL POPUP OVERLAY --- */}
        {showGoalPopup && <GoalPopup game={game} onDismiss={() => setShowGoalPopup(false)} />}

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* --- HEADER --- */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLive ? (
                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/20 px-3 py-1.5 shadow-[0_0_15px_-5px_rgba(var(--primary),0.5)]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                  <span className="text-[11px] font-black text-primary uppercase tabular-nums tracking-wider">
                    {game.gameTime}' min
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-black tracking-widest text-white/40 uppercase">
                  {isFinished
                    ? 'Full Time'
                    : new Date(game.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                </span>
              )}
            </div>
            <span className="max-w-30 truncate text-[10px] font-bold text-white/30 uppercase">
              {game.competitionDisplayName}
            </span>
          </div>

          {/* --- TEAMS --- */}
          <div className="space-y-4">
            {[game.homeCompetitor, game.awayCompetitor].map((team, idx) => {
              const isWinner =
                isFinished &&
                team.score > (idx === 0 ? game.awayCompetitor.score : game.homeCompetitor.score);
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-1.5 ${isLive ? 'bg-white/10' : 'bg-white/5'}`}>
                      <img
                        src={`https://imagecache.365scores.com/image/upload/f_auto,w_48/competitors/${team.id}`}
                        className="h-7 w-7"
                        alt=""
                      />
                    </div>
                    <span
                      className={`text-base tracking-tight ${isWinner || isLive ? 'font-black text-white' : 'font-medium text-white/70'}`}
                    >
                      {team.name}
                    </span>
                  </div>
                  {!isScheduled && (
                    <span
                      className={`${isLive ? 'text-3xl' : 'text-2xl'} font-black tabular-nums ${isWinner || isLive ? 'text-white' : 'text-white/20'}`}
                    >
                      {team.score}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- VISUAL PROGRESS BAR --- */}
        {!isScheduled && (
          <div className="relative h-1.5 w-full bg-white/5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                isLive ? 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]' : 'bg-white/10'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
      {isModalOpen && <MatchCenter gameId={game.id} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
