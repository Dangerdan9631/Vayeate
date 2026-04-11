import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';
import {
  OnViewportResizeEventController,
  OnWindowMoveEventController,
  OnWindowResizeEventController,
  OnWindowStateEventController,
} from '../../controllers/window-controller';
import { OnGlobalKeyDownEventController } from '../../controllers/app-controller/on-global-key-down-event-controller';

@singleton()
export class InitializeWindowServiceOperation {
  constructor(
    private readonly windowService: WindowService,
    private readonly onWindowStateEvent: OnWindowStateEventController,
    private readonly onWindowResizeEvent: OnWindowResizeEventController,
    private readonly onWindowMoveEvent: OnWindowMoveEventController,
    private readonly onViewportResizeEvent: OnViewportResizeEventController,
    private readonly onGlobalKeyDownEvent: OnGlobalKeyDownEventController,
  ) {}

  execute(): void {
    this.windowService.init({
      onStateEvent: (e) => {
        void this.onWindowStateEvent.run(e);
      },
      onResize: (s) => {
        void this.onWindowResizeEvent.run(s);
      },
      onMove: (p) => {
        void this.onWindowMoveEvent.run(p);
      },
      onViewportResize: (size) => {
        void this.onViewportResizeEvent.run(size);
      },
      onGlobalKeyDown: (e) => {
        void this.onGlobalKeyDownEvent.run(e);
      },
    });
  }
}
