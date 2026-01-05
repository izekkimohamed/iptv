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
  minItemWidth = 180,
  gapClassName = 'gap-3',
  estimateItemHeight = 200,
  className,
  itemKey,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Resize Observer logic...
  useEffect(() => {
    if (!parentRef.current) return;
    let timeoutId: NodeJS.Timeout;
    const ro = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const entry = entries[0];
        if (entry) {
          setContainerWidth(entry.contentRect.width);
        }
      }, 16);
    });
    ro.observe(parentRef.current);
    return () => {
      clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, []);

  // Calculate columns
  const { columnCount, rowCount } = useMemo(() => {
    if (containerWidth === 0) return { columnCount: 1, rowCount: 0 };
    const cols = Math.max(1, Math.floor(containerWidth / minItemWidth)); // Ensure at least 1 col
    const rows = Math.ceil(items.length / cols);
    return { columnCount: cols, rowCount: rows };
  }, [containerWidth, minItemWidth, items.length]);

  const getScrollElement = useCallback(() => parentRef.current, []);
  const estimateSize = useCallback(() => estimateItemHeight, [estimateItemHeight]);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement,
    estimateSize,
    overscan: 3,
  });

  // Pre-calculate data slices
  const rows = useMemo(() => {
    return Array.from({ length: rowCount }, (_, rowIndex) => {
      const start = rowIndex * columnCount;
      const end = Math.min(start + columnCount, items.length);
      return { rowIndex, start, end };
    });
  }, [rowCount, columnCount, items.length]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={className}
      style={{ height: '100%', overflowY: 'auto', contain: 'strict' }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
          width: '100%',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const { start, end } = rows[virtualRow.index] || { start: 0, end: 0 };
          const rowItems = items.slice(start, end);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index} // 1. Important: Index for the measurer
              ref={virtualizer.measureElement} // 2. Critical Fix: Allows dynamic height measurement
              className={`grid ${gapClassName}`}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                // Add padding bottom to simulate vertical gap since we are absolute positioning
                paddingBottom: '12px',
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
