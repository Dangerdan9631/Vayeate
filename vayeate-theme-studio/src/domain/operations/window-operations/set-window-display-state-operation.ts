import { singleton } from 'tsyringe';
import type { WindowStateEvent } from '../../../model/window-state-event';
import { WindowStore } from '../../state/window/window-store';

@singleton()
export class SetWindowDisplayStateOperation {
  constructor(private readonly windowStore: WindowStore) {}

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
