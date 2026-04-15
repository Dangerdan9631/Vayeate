import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/window/window-store';

@singleton()
export class ValidateCanMaximizeWindow {
  constructor(private readonly windowStore: WindowStore) {}

  test(): boolean {
    return !this.windowStore.getStore().state.isMaximized;
  }
}
