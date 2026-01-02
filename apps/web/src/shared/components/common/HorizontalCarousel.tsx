'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';

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
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = (amount: number) => {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleScrollCheck = () => {
    if (scrollerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
      setShowLeftButton(scrollLeft > 10);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className={cn('group/carousel relative', className)}>
      {showEdges && (
        <>
          <div className="pointer-events-none absolute top-0 left-0 z-20 h-full w-20 rounded-l-xl bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent opacity-90" />
          <div className="pointer-events-none absolute top-0 right-0 z-20 h-full w-20 rounded-r-xl bg-gradient-to-l from-slate-950 via-slate-950/60 to-transparent opacity-90" />
        </>
      )}

      {showLeftButton && (
        <Button
          aria-label={ariaLabelLeft}
          onClick={() => handleScroll(-scrollBy)}
          className="absolute top-1/2 left-3 z-30 h-12 w-12 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/90 p-0 text-white opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover/carousel:opacity-100 hover:scale-110 hover:border-amber-500/50 hover:bg-slate-800/95 hover:shadow-2xl hover:shadow-amber-500/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {showRightButton && (
        <Button
          aria-label={ariaLabelRight}
          onClick={() => handleScroll(scrollBy)}
          className="absolute top-1/2 right-3 z-30 h-12 w-12 -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/90 p-0 text-white opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover/carousel:opacity-100 hover:scale-110 hover:border-amber-500/50 hover:bg-slate-800/95 hover:shadow-2xl hover:shadow-amber-500/20"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}

      <div
        ref={scrollerRef}
        onScroll={handleScrollCheck}
        className={cn(
          'scrollbar-hide flex gap-5 overflow-x-auto scroll-smooth rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/40 to-slate-950/40 p-6 shadow-inner backdrop-blur-sm',
          contentClassName,
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
