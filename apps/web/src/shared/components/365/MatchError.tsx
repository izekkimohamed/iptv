'use client';

import { X } from 'lucide-react';

interface MatchErrorProps {
  onClose: () => void;
}

export function MatchError({ onClose }: MatchErrorProps) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Close error dialog"
    >
      <div className="animate-in zoom-in max-w-md rounded-3xl border border-red-500/50 bg-[#0f0f0f] p-8 text-center shadow-2xl duration-300">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <X className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="mb-2 text-lg font-black text-red-400">Connection Error</h3>
        <p className="mb-4 text-sm text-white/60">Failed to load match details</p>
        <button
          onClick={onClose}
          className="rounded-sm bg-red-500/20 px-6 py-2 font-bold text-red-400 transition-all hover:bg-red-500/30"
        >
          Close
        </button>
      </div>
    </div>
  );
}
