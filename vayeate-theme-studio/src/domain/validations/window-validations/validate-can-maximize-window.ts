import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/ui/window-store';

/**
 * Checks whether the native window can be maximized from its current state.
 */
@singleton()
export class ValidateCanMaximizeWindow {
  constructor(private readonly windowStore: WindowStore) {}

  /**
   * Reads the current window snapshot to see if maximize is allowed.
   *
   * @returns `true` when the window is not already maximized.
   */
  test(): boolean {
    return !this.windowStore.getStore().state.isMaximized;
  }
}
