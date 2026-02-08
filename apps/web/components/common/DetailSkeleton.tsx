import { Skeleton } from "@/components/ui/skeleton";

export const DetailSkeleton = () => {
  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* 1. Backdrop Skeleton */}
      <div className="absolute inset-0 h-[85vh] w-full">
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent z-10" />
        <Skeleton className="h-full w-full opacity-10" />
      </div>

      {/* 2. Main Content Skeleton */}
      <div className="relative z-20 mx-auto max-w-400 px-6 lg:px-12 pt-[25vh] lg:pt-[35vh]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

          {/* Left Column: Poster Skeleton */}
          <div className="my-auto hidden lg:col-span-3 lg:block">
            <Skeleton className="aspect-2/3 w-full rounded-2xl border border-white/5" />
          </div>

          {/* Right Column: Info Skeleton */}
          <div className="flex flex-col justify-end lg:col-span-9 space-y-8">
            <div className="space-y-6">
              {/* Mobile Poster Placeholder */}
              <Skeleton className="block lg:hidden h-64 w-44 rounded-xl" />

              {/* Badges */}
              <div className="flex gap-3">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>

              {/* Title */}
              <Skeleton className="h-16 w-3/4 lg:h-24 rounded-2xl" />

              {/* Metadata */}
              <div className="flex items-center gap-6">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-3 max-w-3xl rounded-2xl border border-white/5 bg-white/2 p-6 backdrop-blur-xl">
               <Skeleton className="h-3 w-20 rounded-full opacity-20" />
               <Skeleton className="h-5 w-full rounded-full" />
               <Skeleton className="h-5 w-5/6 rounded-full" />
               <Skeleton className="h-5 w-4/6 rounded-full" />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Skeleton className="h-16 w-44 rounded-2xl" />
              <Skeleton className="h-16 w-44 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* 3. Sections Skeletons */}
        <div className="mt-32 space-y-24 pb-20">
          {/* Cast Section */}
          <div className="space-y-8">
             <div className="flex gap-4">
                <Skeleton className="h-8 w-1.5 rounded-full" />
                <Skeleton className="h-8 w-40 rounded-full" />
             </div>
             <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    <Skeleton className="aspect-square w-full rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>
                ))}
             </div>
          </div>

          {/* Trailers Section */}
          <div className="space-y-8">
             <div className="flex gap-4">
                <Skeleton className="h-8 w-1.5 rounded-full" />
                <Skeleton className="h-8 w-48 rounded-full" />
             </div>
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video w-full rounded-2xl" />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
