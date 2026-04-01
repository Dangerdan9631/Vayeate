import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdateOperation } from '../../operations/window-operations';

@singleton()
export class OnWindowResizeEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdateOperation) {}

  run(size: { width: number; height: number }): void {
    this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_SIZE', size });
  }
}

