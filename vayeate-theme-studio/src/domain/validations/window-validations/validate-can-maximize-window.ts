import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/ui/window-store';

@singleton()
export class ValidateCanMaximizeWindow {
  constructor(private readonly windowStore: WindowStore) {}

  test(): boolean {
    return !this.windowStore.getStore().state.isMaximized;
  }
}
