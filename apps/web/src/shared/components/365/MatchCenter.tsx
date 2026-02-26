import { useSyncExternalStore } from 'react';
import useSWR from 'swr';
import { EventTimeline } from './Events';
import { MatchError } from './MatchError';
import { MatchHeader } from './MatchHeader';
import { MatchLoading } from './MatchLoading';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const createVisibilityStore = () => {
  let isVisible = false;
  const listeners = new Set<() => void>();

  const setVisible = (value: boolean) => {
    isVisible = value;
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (!isVisible && typeof window !== 'undefined') {
        setTimeout(() => setVisible(true), 50);
      }
      return () => listeners.delete(listener);
    },
    getSnapshot: () => isVisible,
    getServerSnapshot: () => false,
    setVisible,
  };
};

const visibilityStore = createVisibilityStore();

interface MatchCenterProps {
  gameId: number;
  onClose: () => void;
}

export function MatchCenter({ gameId, onClose }: MatchCenterProps) {
  const isVisible = useSyncExternalStore(
    visibilityStore.subscribe,
    visibilityStore.getSnapshot,
    visibilityStore.getServerSnapshot,
  );

  const {
    data: match,
    error,
    isLoading,
  } = useSWR(
    gameId ? `${process.env.NEXT_PUBLIC_API_URL}/match-details?id=${gameId}` : null,
    fetcher,
    { refreshInterval: 30000 },
  );

  const handleClose = () => {
    visibilityStore.setVisible(false);
    setTimeout(onClose, 300);
  };

  if (error) {
    return <MatchError onClose={handleClose} />;
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10">
      <div
        className={`animate-in fade-in absolute inset-0 bg-black/15 backdrop-blur-xl duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close match center"
      />

      <div
        className={`h-70vh animate-in zoom-in relative flex max-h-[70vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#1a1a1a24] to-[#0a0a0a24] duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <button
          onClick={handleClose}
          className="group absolute top-4 right-4 z-50 rounded-full bg-white/5 p-2 transition-all hover:bg-white/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-white/50 group-hover:text-white"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {isLoading ? (
          <MatchLoading />
        ) : (
          <div
            className="flex flex-1 flex-col overflow-y-auto"
            style={{
              scrollbarColor: '#f4f4f424 transparent',
              scrollbarWidth: 'thin',
            }}
          >
            <MatchHeader match={match} />

            <div className="px-8">
              <EventTimeline match={match} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
