'use client';

import { Activity, Check, Loader2 } from 'lucide-react';

import { CreationStage } from '@/app/settings/page';
import { cn } from '@/lib/utils';

const InstallationOverlay = ({
  currentStage,
  totalProgress,
  isUpdating,
}: {
  currentStage: CreationStage;
  totalProgress: number;
  isUpdating: boolean;
}) => {
  // Helper to determine stage status
  const getStageStatus = (stage: string) => {
    const stages = Object.values(CreationStage);
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage as CreationStage);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/5 backdrop-blur-md transition-all duration-500">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/50 shadow-2xl shadow-black/80">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-50" />

        <div className="space-y-10 p-10">
          {/* Header Section */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/20 duration-1000" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500/30 bg-neutral-800 text-amber-500 shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]">
                <Activity className="h-10 w-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {isUpdating ? 'System Synchronization' : 'Initializing Node'}
              </h2>
              <p className="mx-auto max-w-sm text-base text-neutral-400">
                Establishing secure connection to remote CDN. Do not close this window.
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-end justify-between px-2">
              <span className="text-sm font-semibold tracking-widest text-neutral-500 uppercase">
                Total Progress
              </span>
              <span className="text-6xl font-black tracking-tighter text-white tabular-nums">
                {Math.round(totalProgress)}
                <span className="text-2xl text-amber-500">%</span>
              </span>
            </div>

            <div className="h-4 w-full overflow-hidden rounded-full border border-white/5 bg-neutral-950">
              <div
                className="relative h-full bg-linear-to-r from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-500 ease-out"
                style={{ width: `${totalProgress}%` }}
              >
                <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-white/20" />
              </div>
            </div>
          </div>

          {/* Stages Grid */}
          <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
            {Object.values(CreationStage)
              .filter((s) => s !== 'completed')
              .map((stage) => {
                const status = getStageStatus(stage);
                return (
                  <div
                    key={stage}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300',
                      status === 'active'
                        ? 'translate-x-1 border-amber-500 bg-amber-500/10 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]'
                        : status === 'completed'
                          ? 'border-emerald-500/20 bg-emerald-500/5 opacity-80'
                          : 'border-white/5 bg-neutral-800/30 opacity-40',
                    )}
                  >
                    {status === 'active' && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" />
                    )}
                    {status === 'completed' && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                    {status === 'pending' && (
                      <div className="h-4 w-4 shrink-0 rounded-full border border-neutral-600" />
                    )}

                    <span
                      className={cn(
                        'text-xs font-bold tracking-wider uppercase',
                        status === 'active'
                          ? 'text-white'
                          : status === 'completed'
                            ? 'text-emerald-400'
                            : 'text-neutral-500',
                      )}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default InstallationOverlay;
