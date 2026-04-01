import { singleton } from 'tsyringe';
import { WindowStateSetter } from '../../state/window-state-setter';
import type { WindowStateUpdate } from '../../state/window-state-reducer';

@singleton()
export class ApplyWindowStateUpdateOperation {
  constructor(private readonly windowStateSetter: WindowStateSetter) {}

  execute(update: WindowStateUpdate): void {
    this.windowStateSetter.apply(update);
  }
}
