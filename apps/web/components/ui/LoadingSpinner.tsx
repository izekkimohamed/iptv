import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16',
    large: 'h-24 w-24',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md'
    : 'flex items-center justify-center p-8';

  return (
    <div className={cn(containerClasses)}>
      <div className="flex flex-col items-center justify-center gap-8">
        <div className={cn('relative', sizeClasses[size])}>
          {/* Outer Ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/10 border-t-primary shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)]" />

          {/* Inner Ring (Counter-rotate) */}
          <div className="absolute inset-2 animate-spin-reverse rounded-full border border-primary/20 border-b-primary opacity-50" />

          {/* Center Glow */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5 blur-xl" />
        </div>

        {message && (
          <div className="space-y-1 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse-slow">
              System Pending
            </p>
            <p className="text-sm font-black tracking-widest text-white/80 uppercase">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
