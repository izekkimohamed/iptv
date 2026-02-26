'use client';

export function MatchLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-green-500" />
    </div>
  );
}
