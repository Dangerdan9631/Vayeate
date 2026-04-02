import { singleton } from 'tsyringe';
import { WindowStateSetter } from '../../state/window/window-state-reducer';
import type { WindowStateUpdate } from '../../state/window/window-state-reducer';

@singleton()
export class ApplyWindowStateUpdateOperation {
  constructor(private readonly windowStateSetter: WindowStateSetter) {}

  execute(update: WindowStateUpdate): void {
    this.windowStateSetter.apply(update);
  }
}
