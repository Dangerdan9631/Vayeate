import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdate } from '../../operations/window-operations';

@singleton()
export class OnViewportResizeEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdate) {}

  run(size: { width: number; height: number }): void {
    this.applyWindowStateUpdate.execute({ type: 'SET_VIEWPORT_SIZE', size });
  }
}

