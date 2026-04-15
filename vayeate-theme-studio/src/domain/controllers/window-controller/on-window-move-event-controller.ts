import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/window/window-store';

@singleton()
export class OnWindowMoveEventController {
  constructor(private readonly windowStore: WindowStore) {}

  async run(position: { x: number; y: number }): Promise<void> {
    this.windowStore.getStore().setWindowPosition(position);
  }
}

