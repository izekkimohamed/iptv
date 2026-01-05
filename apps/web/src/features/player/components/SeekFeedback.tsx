import { cn } from '@/lib/utils';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react';

export type FeedbackAction = 'forward' | 'backward' | 'play' | 'pause' | null;

interface SeekFeedbackProps {
  action: FeedbackAction;
}

export function SeekFeedback({ action }: SeekFeedbackProps) {
  if (!action) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          'rounded-full bg-black/60 p-6 text-white backdrop-blur-sm',
          'animate-in fade-in zoom-in fill-mode-forwards duration-300 ease-out',
        )}
      >
        {action === 'forward' && <RotateCw className="h-8 w-8" />}
        {action === 'backward' && <RotateCcw className="h-8 w-8" />}
        {action === 'play' && <Play className="h-8 w-8 fill-current" />}
        {action === 'pause' && <Pause className="h-8 w-8 fill-current" />}
      </div>
    </div>
  );
}
