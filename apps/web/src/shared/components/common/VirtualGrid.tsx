'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type VirtualGridProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  minItemWidth?: number;
  gapClassName?: string;
  estimateItemHeight?: number;
  className?: string;
  itemKey?: (item: T, index: number) => string | number;
};

export default function VirtualGrid<T>({
  items,
  renderItem,
  minItemWidth = 230,
  gapClassName = 'gap-3',
  estimateItemHeight = 360,
  className,
  itemKey,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Debounced resize handler to prevent excessive re-renders
  useEffect(() => {
    if (!parentRef.current) return;

    let timeoutId: NodeJS.Timeout;
    const ro = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const entry = entries[0];
        const width = entry.contentRect.width;
        setContainerWidth(width);
      }, 16); // ~60fps
    });

    ro.observe(parentRef.current);
    return () => {
      clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, []);

  // Memoize column and row calculations
  const { columnCount, rowCount } = useMemo(() => {
    const cols = Math.max(2, Math.floor(containerWidth / minItemWidth));
    const rows = Math.ceil(items.length / cols);
    return { columnCount: cols, rowCount: rows };
  }, [containerWidth, minItemWidth, items.length]);

  // Memoize virtualizer config
  const getScrollElement = useCallback(() => parentRef.current, []);
  const estimateSize = useCallback(() => estimateItemHeight, [estimateItemHeight]);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement,
    estimateSize,
    overscan: 3, // Reduced from 5 for better performance
  });

  // Pre-calculate rows data structure
  const rows = useMemo(() => {
    return Array.from({ length: rowCount }, (_, rowIndex) => {
      const start = rowIndex * columnCount;
      const end = Math.min(start + columnCount, items.length);
      return { rowIndex, start, end };
    });
  }, [rowCount, columnCount, items.length]);

  // Memoize grid columns style
  const gridColumnsStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }),
    [columnCount],
  );

  // Memoize virtual items to prevent unnecessary recalculations
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={className}
      style={{ height: '100%', overflow: 'auto', willChange: 'transform' }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
          contain: 'layout style paint', // CSS containment for better performance
        }}
      >
        {virtualItems.map((virtualRow) => {
          const { start, end } = rows[virtualRow.index] || { start: 0, end: 0 };
          const rowItems = items.slice(start, end);

          return (
            <div
              key={virtualRow.key}
              className={`grid ${gapClassName}`}
              style={{
                ...gridColumnsStyle,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                willChange: 'transform',
              }}
            >
              {rowItems.map((item, i) => {
                const itemIndex = start + i;
                const key = itemKey ? itemKey(item, itemIndex) : itemIndex;
                return <div key={key}>{renderItem(item, itemIndex)}</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
