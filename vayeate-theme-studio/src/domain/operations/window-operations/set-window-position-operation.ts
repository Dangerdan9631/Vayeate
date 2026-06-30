import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/ui/window-store';
import { Point } from '../../../model/point';

/**
 * Updates window position in the domain or UI store.
 */

@singleton()
export class SetWindowPositionOperation {
  constructor(private readonly windowStore: WindowStore) {}

  /**
   * Runs the set window position mutation.
   * @param position Position (Point).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(position: Point): void {
    this.windowStore.getStore().setWindowPosition(position);
  }
}
