import { singleton } from 'tsyringe';
import { WindowStateGetter } from '../../state/window/window-state-reducer';

@singleton()
export class ValidateCanRestoreWindow {
  constructor(private readonly windowStateGetter: WindowStateGetter) {}

  test(): boolean {
    const { isMaximized, isMinimized } = this.windowStateGetter.current();
    return isMaximized || isMinimized;
  }
}
