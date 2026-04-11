import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdateOperation } from '../../operations/window-operations/apply-window-state-update-operation';

@singleton()
export class OnWindowMoveEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdateOperation) {}

  async run(position: { x: number; y: number }): Promise<void> {
    this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_POSITION', position });
  }
}

