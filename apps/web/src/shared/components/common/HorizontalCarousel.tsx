import { ReactNode, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HorizontalCarouselProps = {
  children: ReactNode;
  contentClassName?: string;
  className?: string;
  scrollBy?: number;
  ariaLabelLeft?: string;
  ariaLabelRight?: string;
  showEdges?: boolean;
};

export default function HorizontalCarousel({
  children,
  contentClassName,
  className,
  scrollBy = 800,
  ariaLabelLeft = 'Scroll left',
  ariaLabelRight = 'Scroll right',
  showEdges = true,
}: HorizontalCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (amount: number) => {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative', className)}>
      {showEdges && (
        <>
          <div className="pointer-events-none absolute top-0 left-0 z-20 h-full w-10 rounded-l-xl bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 z-20 h-full w-10 rounded-r-xl bg-gradient-to-l from-black to-transparent" />
        </>
      )}
      <Button
        aria-label={ariaLabelLeft}
        onClick={() => handleScroll(-scrollBy)}
        className="absolute top-1/2 left-2 z-30 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-white hover:bg-white/20"
      >
        ‹
      </Button>
      <Button
        aria-label={ariaLabelRight}
        onClick={() => handleScroll(scrollBy)}
        className="absolute top-1/2 right-2 z-30 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-white hover:bg-white/20"
      >
        ›
      </Button>
      <div
        ref={scrollerRef}
        className={cn(
          'flex gap-4 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/30 p-4',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
