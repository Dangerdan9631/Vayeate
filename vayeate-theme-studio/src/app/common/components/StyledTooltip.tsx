import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useViewportSize } from '../viewmodel/use-viewport-size';

const OFFSET = 8;
const PADDING = 8;

/**
 * Renders a single global tooltip element and listens for mouseover on elements
 * with a title. Shows a styled tooltip (using --tooltip-* CSS vars) and
 * temporarily removes the native title so only our tooltip is visible.
 */
export function StyledTooltip() {
  const viewport = useViewportSize();
  const [state, setState] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const backupTitleRef = useRef<string | null>(null);
  const anchorRectRef = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!state || !tooltipRef.current || !anchorRectRef.current) return;
    const tip = tooltipRef.current;
    const rect = anchorRectRef.current;
    const tipRect = tip.getBoundingClientRect();
    const viewW = viewport.width > 0 ? viewport.width : 1;
    const viewH = viewport.height > 0 ? viewport.height : 1;
    let x = rect.left;
    let y = rect.bottom + OFFSET;
    if (x + tipRect.width + PADDING > viewW) x = viewW - tipRect.width - PADDING;
    if (x < PADDING) x = PADDING;
    if (y + tipRect.height + PADDING > viewH) y = rect.top - tipRect.height - OFFSET;
    if (y < PADDING) y = PADDING;
    if (x !== state.x || y !== state.y) {
      setState((prev) => prev ? { ...prev, x, y } : null);
    }
  }, [state?.text, viewport.width, viewport.height]);

  useEffect(() => {
    function show(el: HTMLElement, text: string, hasTitle: boolean) {
      targetRef.current = el;
      backupTitleRef.current = hasTitle ? text : null;
      if (hasTitle) {
        el.removeAttribute('title');
      }
      const rect = el.getBoundingClientRect();
      anchorRectRef.current = rect;
      setState({
        text,
        x: rect.left,
        y: rect.bottom + OFFSET,
      });
    }

    function hide() {
      const el = targetRef.current;
      const backup = backupTitleRef.current;
      if (el && backup !== null) {
        el.setAttribute('title', backup);
      }
      targetRef.current = null;
      backupTitleRef.current = null;
      anchorRectRef.current = null;
      setState(null);
    }

    /** Find element with tooltip text: nearest ancestor (or self) with title or aria-label. Skip menu bar so menu buttons have no tooltips. */
    function findTooltipSource(el: HTMLElement | null): { el: HTMLElement; text: string; hasTitle: boolean } | null {
      let current: HTMLElement | null = el;
      while (current && current !== document.body) {
        if (current.closest('.menu-bar')) return null;
        const title = current.getAttribute('title');
        const aria = current.getAttribute('aria-label');
        if (title != null && title.trim()) {
          return { el: current, text: title.trim(), hasTitle: true };
        }
        if (aria != null && aria.trim()) {
          return { el: current, text: aria.trim(), hasTitle: false };
        }
        current = current.parentElement;
      }
      return null;
    }

    function handleOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target || !(target instanceof HTMLElement)) return;
      const found = findTooltipSource(target);
      if (found) {
        if (targetRef.current && targetRef.current !== found.el) {
          hide();
        }
        show(found.el, found.text, found.hasTitle);
      }
    }

    function handleOut(e: MouseEvent) {
      const target = e.target as Node;
      const related = e.relatedTarget as Node | null;
      const current = targetRef.current;
      if (!current) return;
      if (current.contains(target) && (!related || !current.contains(related))) {
        hide();
      }
    }

    document.addEventListener('mouseover', handleOver, true);
    document.addEventListener('mouseout', handleOut, true);
    return () => {
      document.removeEventListener('mouseover', handleOver, true);
      document.removeEventListener('mouseout', handleOut, true);
      hide();
    };
  }, []);

  if (!state) return null;

  return (
    <div
      ref={tooltipRef}
      className="app-tooltip"
      role="tooltip"
      style={{
        left: state.x,
        top: state.y,
      }}
    >
      {state.text}
    </div>
  );
}
