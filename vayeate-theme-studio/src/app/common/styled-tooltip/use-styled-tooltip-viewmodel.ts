import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useStore } from 'zustand';
import { WindowStore } from '../../../domain/state/ui/window-store';
import { container } from 'tsyringe';
import { StyledTooltipUiStore } from '../../../domain/state/ui/styled-tooltip-ui-store';
import type { StyledTooltipState } from '../../../model/styled-tooltip';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { StyledTooltipActionType } from './actions/styled-tooltip-action-type';

const OFFSET = 8;
const PADDING = 8;

const windowStore = container.resolve(WindowStore);
const styledTooltipStore = container.resolve(StyledTooltipUiStore);

/**
 * Presentation state for the global styled tooltip overlay.
 */
export interface StyledTooltipViewModel {
  state: StyledTooltipState | null;
  tooltipRef: RefObject<HTMLDivElement | null>;
}

/**
 * Wires document hover listeners, native title suppression, and viewport-aware reposition actions.
 * @returns View model for the styled tooltip component.
 */
export function useStyledTooltipViewModel(): StyledTooltipViewModel {
  const dispatch = useAppDispatch();
  const viewport = useStore(windowStore.api, (state) => state.state.viewport);
  const state = useStore(styledTooltipStore.api, (store) => store.state.tooltip);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const backupTitleRef = useRef<string | null>(null);
  const anchorRectRef = useRef<DOMRect | null>(null);

  const restoreNativeTitle = useCallback(() => {
    const el = targetRef.current;
    const backup = backupTitleRef.current;
    if (el && backup !== null) {
      el.setAttribute('title', backup);
    }
    targetRef.current = null;
    backupTitleRef.current = null;
    anchorRectRef.current = null;
  }, []);

  const hide = useCallback(() => {
    restoreNativeTitle();
    dispatch({ type: StyledTooltipActionType.TooltipSourceOnMouseOut });
  }, [dispatch, restoreNativeTitle]);

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
      dispatch({ type: StyledTooltipActionType.TooltipOnPositionChange, position: { x, y } });
    }
  }, [dispatch, state, viewport.width, viewport.height]);

  useEffect(() => {
    function show(el: HTMLElement, text: string, hasTitle: boolean) {
      targetRef.current = el;
      backupTitleRef.current = hasTitle ? text : null;
      if (hasTitle) {
        el.removeAttribute('title');
      }
      const rect = el.getBoundingClientRect();
      anchorRectRef.current = rect;
      dispatch({
        type: StyledTooltipActionType.TooltipSourceOnMouseOver,
        tooltip: {
          text,
          x: rect.left,
          y: rect.bottom + OFFSET,
        },
      });
    }

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
  }, [dispatch, hide]);

  return { state, tooltipRef };
}
