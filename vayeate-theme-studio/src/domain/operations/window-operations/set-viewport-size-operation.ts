import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/window/window-store';
import { Size } from '../../../model/point';

@singleton()
export class SetViewportSizeOperation {
  constructor(private readonly windowStore: WindowStore) {}

  execute(size: Size): void {
    this.windowStore.getStore().setViewportSize(size);
  }
}
