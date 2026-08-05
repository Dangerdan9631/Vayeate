import type { Point, Size } from '../../../../model/Common/point';
import type { WindowStateEvent } from '../../../../model/Common/window-state-event';

/**
 * Input or state shape for keyboard shortcut event.
 */

export interface KeyboardShortcutEvent {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  key: string;
  preventDefault: () => void;
}

/**
 * Input or state shape for window initialization callbacks.
 */

export interface WindowInitializationCallbacks {
  onStateEvent: (event: WindowStateEvent) => void;
  onResize?: (size: Size) => void;
  onMove?: (position: Point) => void;
  onViewportResize: (size: Size) => void;
  onGlobalKeyDown: (event: KeyboardShortcutEvent) => void;
}
