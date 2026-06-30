import { singleton } from 'tsyringe';
import type { WindowStateEvent } from '../../../model/window-state-event';
import { WindowStore } from '../../state/ui/window-store';

/**
 * Updates window display state in the domain or UI store.
 */

@singleton()
export class SetWindowDisplayStateOperation {
  constructor(private readonly windowStore: WindowStore) {}

  /**
   * Runs the set window display state mutation.
   * @param event Event (WindowStateEvent).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(event: WindowStateEvent): void {
    switch (event) {
      case 'minimized':
        this.windowStore.getStore().setWindowMinimized(true);
        break;
      case 'maximized':
        this.windowStore.getStore().setWindowMaximized(true);
        break;
      case 'unmaximized':
        this.windowStore.getStore().setWindowMaximized(false);
        break;
      case 'restored':
        this.windowStore.getStore().setWindowMinimized(false);
        break;
      default: {
        const _exhaustive: never = event;
        void _exhaustive;
      }
    }
  }
}
