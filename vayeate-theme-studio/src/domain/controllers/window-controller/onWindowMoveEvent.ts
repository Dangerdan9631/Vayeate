import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdate } from '../../operations/window-operations';

@singleton()
export class OnWindowMoveEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdate) {}

  run(position: { x: number; y: number }): void {
    this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_POSITION', position });
  }
}

