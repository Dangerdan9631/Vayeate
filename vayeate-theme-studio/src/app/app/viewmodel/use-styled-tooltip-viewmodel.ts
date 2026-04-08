import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../../core/components/AppProvider';

export interface StyledTooltipViewModel {
  viewport: { width: number; height: number };
}

/** Viewport from app state for tooltip clamping (`WindowService` resize → `SET_VIEWPORT_SIZE`). */
export function useStyledTooltipViewModel(): StyledTooltipViewModel {
  const viewport = useContextSelector(AppContext, (c) => c?.state.window.viewport);
  if (viewport === undefined) {
    throw new Error('useStyledTooltipViewModel must be used within AppProvider');
  }
  return { viewport };
}
