import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className={cn('group/carousel relative', className)}>
      {/* {showEdges && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-background to-transparent" />
        </>
      )} */}

      <Button
        variant="ghost"
        size="icon"
        aria-label={ariaLabelLeft}
        onClick={() => handleScroll(-scrollBy)}
        className="absolute left-0 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-black/50 group-hover/carousel:left-2 group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label={ariaLabelRight}
        onClick={() => handleScroll(scrollBy)}
        className="absolute -right-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-black/10 group-hover/carousel:right-2 group-hover/carousel:opacity-100"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div
        ref={scrollerRef}
        className={cn(
          'scrollbar-hide flex gap-6 overflow-x-auto p-2',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

