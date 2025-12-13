import { useEffect } from 'react';

type Options = {
  containerRef: React.RefObject<HTMLElement | null>;
  selectedId: string | number | null | undefined;
  primaryAttr: string; // e.g. "data-category-id"
  fallbackAttr?: string; // e.g. "data-category-streamid"
  deps?: any[]; // extra dependencies like categories?.length
  isLoading?: boolean;
};

export function useAutoScrollToSelected({
  containerRef,
  selectedId,
  primaryAttr,
  fallbackAttr,
  deps = [],
  isLoading,
}: Options) {
  useEffect(() => {
    if (!selectedId || !containerRef.current) return;

    const container = containerRef.current;

    const scrollToSelected = () => {
      let selector = `[${primaryAttr}="${selectedId}"]`;

      let selectedEl = container.querySelector(selector) as HTMLElement | null;

      if (!selectedEl && fallbackAttr) {
        selectedEl = container.querySelector(
          `[${fallbackAttr}="${selectedId}"]`,
        ) as HTMLElement | null;
      }

      if (!selectedEl) {
        // Retry next frame
        requestAnimationFrame(() => {
          const retryEl = container.querySelector(
            fallbackAttr
              ? `[${primaryAttr}="${selectedId}"],[${fallbackAttr}="${selectedId}"]`
              : `[${primaryAttr}="${selectedId}"]`,
          ) as HTMLElement | null;

          if (retryEl) {
            const offset =
              retryEl.offsetTop - container.clientHeight / 2 + retryEl.clientHeight / 2;

            container.scrollTo({
              top: Math.max(0, offset),
              behavior: 'smooth',
            });
          }
        });
        return;
      }

      const offset =
        selectedEl.offsetTop - container.clientHeight / 2 + selectedEl.clientHeight / 2;

      container.scrollTo({
        top: Math.max(0, offset),
        behavior: 'smooth',
      });
    };

    scrollToSelected();
    const t = window.setTimeout(scrollToSelected, 120);

    return () => window.clearTimeout(t);
  }, [selectedId, isLoading, ...deps]);
}
