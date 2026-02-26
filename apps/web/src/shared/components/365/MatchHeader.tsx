'use client';

import { Clock, X } from 'lucide-react';
import Image from 'next/image';

interface MatchHeaderProps {
  match: {
    competitionDisplayName: string;
    homeCompetitor: {
      id: number;
      name: string;
      score: number;
    };
    awayCompetitor: {
      id: number;
      name: string;
      score: number;
    };
    statusText: string;
  };
}

export function MatchHeader({ match }: MatchHeaderProps) {
  return (
    <div className="sticky top-0 z-30 shrink-0 space-y-5 border-white/5 px-8 pt-12 text-center backdrop-blur-md">
      <div className="mb-6 flex flex-col items-center gap-2">
        <span className="text-xs font-bold tracking-widest text-white/40 uppercase">
          {match.competitionDisplayName}
        </span>
      </div>

      <div className="flex items-center justify-center gap-10">
        <div className="flex flex-1 flex-col items-center">
          <Image
            src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.homeCompetitor.id}`}
            width={64}
            height={64}
            className="mb-3 h-16 w-16 object-contain"
            alt="home"
          />
          <span className="text-sm font-bold text-white">{match.homeCompetitor.name}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="font-black text-white">
            {match.statusText === 'Scheduled' ? (
              <span>The Game Isn't Started Yet</span>
            ) : (
              <span className="text-5xl">
                {match.homeCompetitor.score} - {match.awayCompetitor.score}
              </span>
            )}
          </div>
          <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500">
            {match.statusText}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center">
          <Image
            src={`https://imagecache.365scores.com/image/upload/f_auto,w_80/competitors/${match.awayCompetitor.id}`}
            width={64}
            height={64}
            className="mb-3 h-16 w-16 object-contain"
            alt="away"
          />
          <span className="text-sm font-bold text-white">{match.awayCompetitor.name}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <Clock className="h-3.5 w-3.5 text-white/60" />
          <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/60 uppercase">
            Match Timeline
          </span>
        </div>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
      </div>
    </div>
  );
}
