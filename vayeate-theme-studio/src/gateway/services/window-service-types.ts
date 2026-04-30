import type { WindowStateEvent } from '../../model/window-state-event';

export interface WindowInitCallbacks {
  onStateEvent: (event: WindowStateEvent) => void;
  /** One-shot hydration from main via getWindowBounds; not driven by IPC during drag/resize. */
  onResize?: (size: { width: number; height: number }) => void;
  onMove?: (position: { x: number; y: number }) => void;
  onViewportResize: (size: { width: number; height: number }) => void;
  onGlobalKeyDown: (e: KeyboardEvent) => void;
}
