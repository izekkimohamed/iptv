'use client';

interface MovieSynopsisProps {
  overview?: string;
}

export function MovieSynopsis({ overview }: MovieSynopsisProps) {
  return (
    <div className="mb-10 max-w-3xl rounded-sm border border-white/5 bg-white/2 p-6 backdrop-blur-xl">
      <h3 className="mb-2 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">
        Synopsis
      </h3>
      <p className="text-lg font-medium leading-relaxed text-neutral-200 lg:text-xl">
        {overview}
      </p>
    </div>
  );
}
