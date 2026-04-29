import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/window/window-store';
import { Point } from '../../../model/point';

@singleton()
export class SetWindowPositionOperation {
  constructor(private readonly windowStore: WindowStore) {}

  execute(position: Point): void {
    this.windowStore.getStore().setWindowPosition(position);
  }
}
