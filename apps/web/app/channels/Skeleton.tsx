'use client';

export default function ChannelsContentSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 animate-pulse">
      {/* Player skeleton */}
      <div className="bg-muted max-h-1/2 w-full rounded-xl aspect-video" />

      {/* Info panel skeleton */}
      <div className="flex flex-col gap-3 px-2">
        <div className="bg-muted h-5 w-1/3 rounded" />
        <div className="bg-muted h-4 w-2/3 rounded" />
        <div className="bg-muted h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}
