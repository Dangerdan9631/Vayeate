import { singleton } from 'tsyringe';
import type { WindowStateEvent } from '../../../gateway/services/window-service';
import { ApplyWindowStateUpdate } from '../../operations/window-operations';

@singleton()
export class OnWindowStateEventController {
  constructor(private readonly applyWindowStateUpdate: ApplyWindowStateUpdate) {}

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

