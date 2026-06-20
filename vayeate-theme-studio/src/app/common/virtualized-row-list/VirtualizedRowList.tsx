import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const VIRTUALIZE_MIN_COUNT = 10;
const VIRTUAL_OVERSCAN = 8;

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

function scrollMarginFor(listEl: HTMLElement, scrollEl: HTMLElement): number {
  return listEl.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
}

/**
 * Props for a scroll-parent-aware virtualized row list.
 */
export interface VirtualizedRowListProps<T> {
  items: readonly T[];
  getItemKey: (item: T, index: number) => string;
  estimateSize: () => number;
  renderItem: (item: T, index: number) => ReactNode;
  emptyHint?: string;
}

/**
 * Renders a list of rows with TanStack virtual scrolling when item count meets the threshold.
 */
export function VirtualizedRowList<T>({
  items,
  getItemKey,
  estimateSize,
  renderItem,
  emptyHint,
}: VirtualizedRowListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const shouldVirtualize = items.length >= VIRTUALIZE_MIN_COUNT;

  const updateScrollMetrics = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const scrollEl = findScrollParent(listEl);
    setScrollElement(scrollEl);
    setScrollMargin(scrollEl ? scrollMarginFor(listEl, scrollEl) : 0);
  }, []);

  useLayoutEffect(() => {
    if (!shouldVirtualize) return;
    updateScrollMetrics();
    const listEl = listRef.current;
    if (!listEl) return;
    const ro = new ResizeObserver(updateScrollMetrics);
    ro.observe(listEl);
    const scrollEl = findScrollParent(listEl);
    if (scrollEl) ro.observe(scrollEl);
    window.addEventListener('resize', updateScrollMetrics);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, [shouldVirtualize, items.length, updateScrollMetrics]);

  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? items.length : 0,
    getScrollElement: () => scrollElement,
    estimateSize,
    overscan: VIRTUAL_OVERSCAN,
    scrollMargin,
  });

  if (items.length === 0) {
    return emptyHint ? <p className="empty-hint">{emptyHint}</p> : null;
  }

  if (!shouldVirtualize) {
    return (
      <>
        {items.map((item, index) => (
          <div key={getItemKey(item, index)} style={{ display: 'contents' }}>
            {renderItem(item, index)}
          </div>
        ))}
      </>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  if (virtualItems.length === 0) {
    return (
      <div ref={listRef} className="virtual-row-list">
        {items.map((item, index) => (
          <div key={getItemKey(item, index)} style={{ display: 'contents' }}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={listRef} className="virtual-row-list">
      <div style={{ height: totalSize, position: 'relative', width: '100%' }}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={getItemKey(item, virtualItem.index)}
              data-index={virtualItem.index}
              ref={(el) => { if (el) virtualizer.measureElement(el); }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start - scrollMargin}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
