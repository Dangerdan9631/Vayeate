import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdateOperation } from '../../operations/window-operations';

@singleton()
export class OnViewportResizeEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdateOperation) {}

  run(size: { width: number; height: number }): void {
    this.applyWindowStateUpdate.execute({ type: 'SET_VIEWPORT_SIZE', size });
  }
}

