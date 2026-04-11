import { singleton } from 'tsyringe';
import type { WindowStateEvent } from '../../../gateway/services/window-service-types';
import { ApplyWindowStateUpdateOperation } from '../../operations/window-operations/apply-window-state-update-operation';

@singleton()
export class OnWindowStateEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdateOperation) {}

  run(event: WindowStateEvent): void {
    switch (event) {
      case 'minimized':
        this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_MINIMIZED', value: true });
        break;
      case 'maximized':
        this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_MAXIMIZED', value: true });
        break;
      case 'unmaximized':
        this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_MAXIMIZED', value: false });
        break;
      case 'restored':
        this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_MINIMIZED', value: false });
        break;
    }
  }
}

