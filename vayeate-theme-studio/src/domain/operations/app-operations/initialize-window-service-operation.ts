import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';
import {
  SyncViewportSizeController,
  SyncWindowDisplayStateController,
  SyncWindowPositionController,
  SyncWindowSizeController,
} from '../../controllers/window-controller';
import { HandleKeyboardShortcutController } from '../../controllers/app-controller/handle-keyboard-shortcut-controller';

@singleton()
export class InitializeWindowServiceOperation {
  constructor(
    private readonly windowService: WindowService,
    private readonly syncWindowDisplayState: SyncWindowDisplayStateController,
    private readonly syncWindowSize: SyncWindowSizeController,
    private readonly syncWindowPosition: SyncWindowPositionController,
    private readonly syncViewportSize: SyncViewportSizeController,
    private readonly handleKeyboardShortcut: HandleKeyboardShortcutController,
  ) {}

  execute(): void {
    this.windowService.init({
      onStateEvent: (e) => {
        void this.syncWindowDisplayState.run(e);
      },
      onResize: (s) => {
        void this.syncWindowSize.run(s);
      },
      onMove: (p) => {
        void this.syncWindowPosition.run(p);
      },
      onViewportResize: (size) => {
        void this.syncViewportSize.run(size);
      },
      onGlobalKeyDown: (e) => {
        void this.handleKeyboardShortcut.run(e);
      },
    });
  }
}
