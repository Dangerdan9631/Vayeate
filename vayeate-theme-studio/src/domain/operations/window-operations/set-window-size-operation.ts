import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/ui/window-store';
import { Size } from '../../../model/point';

/**
 * Updates window size in the domain or UI store.
 */

@singleton()
export class SetWindowSizeOperation {
  constructor(private readonly windowStore: WindowStore) {}

  /**
   * Runs the set window size mutation.
   * @param size Size (Size).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(size: Size): void {
    this.windowStore.getStore().setWindowSize(size);
  }
}
