import type { Point, Size } from '../../../model/point';
import type { WindowStateEvent } from '../../../model/window-state-event';

export interface KeyboardShortcutEvent {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  key: string;
  preventDefault: () => void;
}

export interface WindowInitializationCallbacks {
  onStateEvent: (event: WindowStateEvent) => void;
  onResize?: (size: Size) => void;
  onMove?: (position: Point) => void;
  onViewportResize: (size: Size) => void;
  onGlobalKeyDown: (event: KeyboardShortcutEvent) => void;
}
