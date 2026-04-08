import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../../core/components/AppProvider';

/** Renderer viewport from app state (updated via `WindowService` resize → `SET_VIEWPORT_SIZE`). */
export function useViewportSize(): { width: number; height: number } {
  const viewport = useContextSelector(AppContext, (c) => c?.state.window.viewport);
  if (viewport === undefined) {
    throw new Error('useViewportSize must be used within AppProvider');
  }
  return viewport;
}
