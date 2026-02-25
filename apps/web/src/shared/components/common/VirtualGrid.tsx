'use client';

import { cn } from '@/shared/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface VirtualRowProps<T> {
  items: T[];
  start: number;
  end: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemKey?: (item: T, index: number) => string | number;
  columnCount: number;
  gapClassName: string;
  virtualStart: number;
  measureElement: (element: HTMLElement | null) => void;
  virtualKey: string;
  virtualIndex: number;
}

function VirtualRowItemWrapper<T>({
  item,
  index,
  renderItem,
}: {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  const content = renderItem(item, index);
  return <>{content}</>;
}

const VirtualRow = memo(function VirtualRow<T>({
  items,
  start,
  end,
  renderItem,
  itemKey,
  columnCount,
  gapClassName,
  virtualStart,
  measureElement,
  virtualKey,
  virtualIndex,
}: VirtualRowProps<T>) {
  const rowItems = items.slice(start, end);

  return (
    <div
      key={virtualKey}
      data-index={virtualIndex}
      ref={measureElement}
      className={`absolute top-0 left-0 grid w-full ${gapClassName}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        transform: `translateY(${virtualStart}px)`,
        paddingBottom: '12px',
      }}
    >
      {rowItems.map((item, i) => {
        const itemIndex = start + i;
        const key = itemKey ? itemKey(item, itemIndex) : itemIndex;
        return (
          <div key={key}>
            <VirtualRowItemWrapper item={item} index={itemIndex} renderItem={renderItem} />
          </div>
        );
      })}
    </div>
  );
}) as <T>(props: VirtualRowProps<T>) => React.ReactElement;

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

  const { columnCount, rowCount } = useMemo(() => {
    if (containerWidth === 0) return { columnCount: 1, rowCount: 0 };
    const cols = Math.max(1, Math.floor(containerWidth / minItemWidth));
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
      className={cn('h-full overflow-y-auto', className)}
      style={{ contain: 'strict' }}
    >
      <div
        className="relative w-full"
        style={{
          height: virtualizer.getTotalSize(),
        }}
      >
        {virtualItems.map((virtualRow) => {
          const { start, end } = rows[virtualRow.index] || { start: 0, end: 0 };

          return (
            <VirtualRow
              key={String(virtualRow.key)}
              items={items}
              start={start}
              end={end}
              renderItem={renderItem}
              itemKey={itemKey}
              columnCount={columnCount}
              gapClassName={gapClassName}
              virtualStart={virtualRow.start}
              measureElement={virtualizer.measureElement}
              virtualKey={String(virtualRow.key)}
              virtualIndex={virtualRow.index}
            />
          );
        })}
      </div>
    </div>
  );
}
