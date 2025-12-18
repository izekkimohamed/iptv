import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ReactNode, useRef } from 'react';

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
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black to-transparent z-20 rounded-l-xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-black to-transparent z-20 rounded-r-xl" />
        </>
      )}
      <Button
        aria-label={ariaLabelLeft}
        onClick={() => handleScroll(-scrollBy)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/40 border border-white/10 text-white rounded-full px-3 py-2 hover:bg-white/20"
      >
        ‹
      </Button>
      <Button
        aria-label={ariaLabelRight}
        onClick={() => handleScroll(scrollBy)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/40 border border-white/10 text-white rounded-full px-3 py-2 hover:bg-white/20"
      >
        ›
      </Button>
      <div
        ref={scrollerRef}
        className={cn(
          'flex overflow-x-auto gap-4 p-4 rounded-xl border border-slate-700 bg-slate-900/30',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
