import type { WindowStateEvent } from '../../../gateway/services/window-service';
import type { WindowStateUpdate } from '../../state/window-state-reducer';

export function mapWindowStateEventToUpdate(event: WindowStateEvent): WindowStateUpdate {
  switch (event) {
    case 'minimized':
      return { type: 'SET_WINDOW_MINIMIZED', value: true };
    case 'maximized':
      return { type: 'SET_WINDOW_MAXIMIZED', value: true };
    case 'unmaximized':
      return { type: 'SET_WINDOW_MAXIMIZED', value: false };
    case 'restored':
      return { type: 'SET_WINDOW_MINIMIZED', value: false };
  }
}
