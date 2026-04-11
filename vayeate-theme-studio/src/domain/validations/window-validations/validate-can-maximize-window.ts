import { singleton } from 'tsyringe';
import { WindowStateGetter } from '../../state/window/window-state-reducer';

@singleton()
export class ValidateCanMaximizeWindow {
  constructor(private readonly windowStateGetter: WindowStateGetter) {}

  test(): boolean {
    return !this.windowStateGetter.current().isMaximized;
  }
}
