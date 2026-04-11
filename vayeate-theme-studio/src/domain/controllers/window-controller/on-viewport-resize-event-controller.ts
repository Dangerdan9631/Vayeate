import { singleton } from 'tsyringe';
import { ApplyWindowStateUpdateOperation } from '../../operations/window-operations/apply-window-state-update-operation';

@singleton()
export class OnViewportResizeEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdateOperation) {}

  async run(size: { width: number; height: number }): Promise<void> {
    this.applyWindowStateUpdate.execute({ type: 'SET_VIEWPORT_SIZE', size });
  }
}

