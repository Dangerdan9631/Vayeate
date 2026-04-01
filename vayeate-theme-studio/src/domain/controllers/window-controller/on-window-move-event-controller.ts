import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdateOperation } from '../../operations/window-operations';

@singleton()
export class OnWindowMoveEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdateOperation) {}

  run(position: { x: number; y: number }): void {
    this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_POSITION', position });
  }
}

