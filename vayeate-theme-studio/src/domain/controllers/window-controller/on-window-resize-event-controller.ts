import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdateOperation } from '../../operations/window-operations/apply-window-state-update-operation';

@singleton()
export class OnWindowResizeEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdateOperation) {}

  run(size: { width: number; height: number }): void {
    this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_SIZE', size });
  }
}

