import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/window/window-store';

@singleton()
export class OnWindowResizeEventController {
  constructor(private readonly windowStore: WindowStore) {}

  async run(size: { width: number; height: number }): Promise<void> {
    this.windowStore.getStore().setWindowSize(size);
  }
}

