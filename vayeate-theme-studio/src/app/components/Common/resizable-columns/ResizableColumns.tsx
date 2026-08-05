import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

interface ResizableColumnsProps {
  className: string;
  defaultColumns: string;
  storageKey: string;
  children: ReactNode;
  minColumnWidth?: number;
}

interface DragState {
  index: number;
  startX: number;
  startWidths: number[];
}

const DEFAULT_MIN_COLUMN_WIDTH = 220;
const HANDLE_WIDTH = 10;

function parseStoredFractions(storageKey: string, count: number): number[] | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null');
    if (!Array.isArray(parsed) || parsed.length !== count) return null;
    const fractions = parsed.map((value) => Number(value));
    if (fractions.some((value) => !Number.isFinite(value) || value <= 0)) return null;
    return fractions;
  } catch {
    return null;
  }
}

function availableColumnWidth(root: HTMLElement, count: number): number {
  const gap = Number.parseFloat(getComputedStyle(root).columnGap || '0') || 0;
  return Math.max(0, root.clientWidth - gap * Math.max(0, count - 1));
}

/**
 * Grid wrapper that lets users drag the gutters between page-level columns.
 */
export function ResizableColumns({
  className,
  defaultColumns,
  storageKey,
  children,
  minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
}: ResizableColumnsProps) {
  const childArray = Children.toArray(children).filter(Boolean);
  const columnRefs = useRef<Array<HTMLElement | null>>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [columnWidths, setColumnWidths] = useState<number[] | null>(null);
  const [handlePositions, setHandlePositions] = useState<number[]>([]);
  const columnCount = childArray.length;

  const measureColumnWidths = useCallback(() => {
    const widths = columnRefs.current
      .slice(0, columnCount)
      .map((element) => element?.getBoundingClientRect().width ?? 0);
    return widths.every((width) => width > 0) ? widths : null;
  }, [columnCount]);

  const updateHandlePositions = useCallback(() => {
    const root = rootRef.current;
    if (!root || columnCount <= 1) {
      setHandlePositions([]);
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const positions: number[] = [];
    for (let index = 0; index < columnCount - 1; index += 1) {
      const leftColumn = columnRefs.current[index];
      const rightColumn = columnRefs.current[index + 1];
      if (!leftColumn || !rightColumn) continue;
      const leftRect = leftColumn.getBoundingClientRect();
      const rightRect = rightColumn.getBoundingClientRect();
      positions.push(leftRect.right - rootRect.left + (rightRect.left - leftRect.right) / 2);
    }
    setHandlePositions(positions);
  }, [columnCount]);

  useLayoutEffect(() => {
    if (columnCount <= 1) {
      setColumnWidths(null);
      setHandlePositions([]);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const storedFractions = parseStoredFractions(storageKey, columnCount);
    if (storedFractions) {
      const availableWidth = availableColumnWidth(root, columnCount);
      const total = storedFractions.reduce((sum, value) => sum + value, 0);
      if (availableWidth > 0 && total > 0) {
        setColumnWidths(storedFractions.map((value) => (value / total) * availableWidth));
      }
    }

    updateHandlePositions();
  }, [columnCount, storageKey, updateHandlePositions]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || columnCount <= 1) return;

    const observer = new ResizeObserver(() => {
      setColumnWidths((current) => {
        if (!current) {
          updateHandlePositions();
          return current;
        }

        const availableWidth = availableColumnWidth(root, columnCount);
        const currentTotal = current.reduce((sum, value) => sum + value, 0);
        if (availableWidth <= 0 || currentTotal <= 0) return current;
        return current.map((value) => Math.max(minColumnWidth, (value / currentTotal) * availableWidth));
      });
      updateHandlePositions();
    });

    observer.observe(root);
    columnRefs.current.slice(0, columnCount).forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [columnCount, minColumnWidth, updateHandlePositions]);

  useEffect(() => {
    updateHandlePositions();
  }, [columnWidths, updateHandlePositions]);

  useEffect(() => {
    if (!columnWidths || columnWidths.length !== columnCount) return;
    const total = columnWidths.reduce((sum, value) => sum + value, 0);
    if (total <= 0) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(columnWidths.map((width) => width / total)),
    );
  }, [columnCount, columnWidths, storageKey]);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;

      const delta = e.clientX - drag.startX;
      const leftStart = drag.startWidths[drag.index];
      const rightStart = drag.startWidths[drag.index + 1];
      const appliedDelta = Math.min(
        Math.max(delta, minColumnWidth - leftStart),
        rightStart - minColumnWidth,
      );
      const next = [...drag.startWidths];
      next[drag.index] = leftStart + appliedDelta;
      next[drag.index + 1] = rightStart - appliedDelta;
      setColumnWidths(next);
    }

    function onPointerUp() {
      dragRef.current = null;
      document.body.classList.remove('is-resizing-columns');
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.classList.remove('is-resizing-columns');
    };
  }, [minColumnWidth]);

  function onHandlePointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    const index = Number(e.currentTarget.dataset.resizeIndex);
    const measured = columnWidths ?? measureColumnWidths();
    if (!Number.isInteger(index) || !measured) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      index,
      startX: e.clientX,
      startWidths: measured,
    };
    setColumnWidths(measured);
    document.body.classList.add('is-resizing-columns');
  }

  function onHandleDoubleClick() {
    window.localStorage.removeItem(storageKey);
    setColumnWidths(null);
    window.requestAnimationFrame(updateHandlePositions);
  }

  const style: CSSProperties | undefined = columnWidths
    ? { gridTemplateColumns: columnWidths.map((width) => `${width}px`).join(' ') }
    : { gridTemplateColumns: defaultColumns };

  return (
    <div
      ref={rootRef}
      className={`${className} resizable-columns`}
      style={style}
    >
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;
        return cloneElement(child as ReactElement<{ ref?: (element: HTMLElement | null) => void }>, {
          ref: (element: HTMLElement | null) => {
            columnRefs.current[index] = element;
          },
        });
      })}
      {columnCount > 1 && handlePositions.map((left, index) => (
        <button
          key={index}
          type="button"
          className="column-resize-handle"
          style={{ left: left - HANDLE_WIDTH / 2 }}
          data-resize-index={index}
          aria-label={`Resize column ${index + 1}`}
          onPointerDown={onHandlePointerDown}
          onDoubleClick={onHandleDoubleClick}
        />
      ))}
    </div>
  );
}
