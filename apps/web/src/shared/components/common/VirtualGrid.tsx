'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';

type VirtualGridProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  minItemWidth?: number;
  gapClassName?: string;
  estimateItemHeight?: number;
  className?: string;
};

export default function VirtualGrid<T>({
  items,
  renderItem,
  minItemWidth = 230,
  gapClassName = 'gap-3',
  estimateItemHeight = 360,
  className,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (!parentRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      setContainerWidth(width);
    });
    ro.observe(parentRef.current);
    return () => ro.disconnect();
  }, []);

  const columnCount = Math.max(1, Math.floor(containerWidth / minItemWidth));
  const rowCount = Math.ceil(items.length / columnCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateItemHeight,
    overscan: 5,
  });

  const rows = useMemo(() => {
    return Array.from({ length: rowCount }).map((_, rowIndex) => {
      const start = rowIndex * columnCount;
      const end = Math.min(start + columnCount, items.length);
      return { rowIndex, start, end };
    });
  }, [rowCount, columnCount, items.length]);

  const gridColumnsStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }),
    [columnCount],
  );

  return (
    <div ref={parentRef} className={className} style={{ height: '100%', overflow: 'auto' }}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const { start, end } = rows[virtualRow.index] || { start: 0, end: 0 };
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
              }}
            >
              {Array.from({ length: end - start }).map((_, i) => {
                const itemIndex = start + i;
                return <div key={itemIndex}>{renderItem(items[itemIndex], itemIndex)}</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
