import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';
import {
  OnViewportResizeEventController,
  OnWindowMoveEventController,
  OnWindowResizeEventController,
  OnWindowStateEventController,
} from '../../controllers/window-controller';
import { OnGlobalKeyDownEventController } from '../../controllers/app-controller/onGlobalKeyDownEvent';

@singleton()
export class InitializeWindowService {
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
      onStateEvent: (e) => this.onWindowStateEvent.run(e),
      onResize: (s) => this.onWindowResizeEvent.run(s),
      onMove: (p) => this.onWindowMoveEvent.run(p),
      onViewportResize: (size) => this.onViewportResizeEvent.run(size),
      onGlobalKeyDown: (e) => this.onGlobalKeyDownEvent.run(e),
    });
  }
}
