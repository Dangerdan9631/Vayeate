import { singleton } from 'tsyringe';
import type { WindowStateEvent } from '../../../gateway/services/window-service-types';
import { WindowStore } from '../../state/window/window-store';

@singleton()
export class OnWindowStateEventController {
  constructor(private readonly windowStore: WindowStore) {}

  async run(event: WindowStateEvent): Promise<void> {
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
    }
  }
}

