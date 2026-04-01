import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdate } from '../../operations/window-operations';

@singleton()
export class OnWindowResizeEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdate) {}

  run(size: { width: number; height: number }): void {
    this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_SIZE', size });
  }
}

