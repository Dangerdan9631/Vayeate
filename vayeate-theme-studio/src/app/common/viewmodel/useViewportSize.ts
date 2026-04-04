import { useAppState } from '../../app/context/app-context-hooks';

/** Renderer viewport from app state (updated via `WindowService` resize → `SET_VIEWPORT_SIZE`). */
export function useViewportSize(): { width: number; height: number } {
  return useAppState().state.window.viewport;
}
