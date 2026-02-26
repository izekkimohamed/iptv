export function SearchLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="space-y-4 animate-pulse">
          <div className="aspect-2/3 rounded-sm bg-white/5" />
          <div className="h-4 w-3/4 rounded-sm bg-white/5" />
        </div>
      ))}
    </div>
  );
}
