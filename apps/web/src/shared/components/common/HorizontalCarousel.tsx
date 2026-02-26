import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode, memo, useCallback, useEffect, useRef } from 'react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type HorizontalCarouselProps = {
  children: ReactNode;
  contentClassName?: string;
  className?: string;
  scrollBy?: number;
  ariaLabelLeft?: string;
  ariaLabelRight?: string;
  showEdges?: boolean;
};

const HorizontalCarousel = memo(function HorizontalCarousel({
  children,
  contentClassName,
  className,
  scrollBy = 800,
  ariaLabelLeft = 'Scroll left',
  ariaLabelRight = 'Scroll right',
  showEdges = true,
}: HorizontalCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback((amount: number) => {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleScroll(-scrollBy);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleScroll(scrollBy);
    }
  }, [handleScroll, scrollBy]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div 
      ref={containerRef}
      className={cn('group/carousel relative', className)}
      tabIndex={0}
      role="region"
      aria-label="Carousel with keyboard navigation"
    >
      {showEdges && (
        <>
          <div className="from-background via-background/50 pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-gradient-to-r to-transparent" />
          <div className="from-background via-background/50 pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-gradient-to-l to-transparent" />
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        aria-label={ariaLabelLeft}
        onClick={() => handleScroll(-scrollBy)}
        className="absolute top-1/2 left-0 z-30 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 opacity-0 backdrop-blur-md transition-all duration-300 group-hover/carousel:left-2 group-hover/carousel:opacity-100 hover:bg-black/50"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label={ariaLabelRight}
        onClick={() => handleScroll(scrollBy)}
        className="absolute top-1/2 -right-4 z-30 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 opacity-0 backdrop-blur-md transition-all duration-300 group-hover/carousel:right-2 group-hover/carousel:opacity-100 hover:bg-black/10"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div
        ref={scrollerRef}
        className={cn('scrollbar-hide flex gap-6 overflow-x-auto p-2', contentClassName)}
      >
        {children}
      </div>
    </div>
  );
});

export default HorizontalCarousel;
