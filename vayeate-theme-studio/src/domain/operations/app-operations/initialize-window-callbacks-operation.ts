import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';
import { SyncViewportSizeController } from '../../../app/app/components/window/controllers/sync-viewport-size-controller';
import { SyncWindowDisplayStateController } from '../../../app/app/components/window/controllers/sync-window-display-state-controller';
import { SyncWindowPositionController } from '../../../app/app/components/window/controllers/sync-window-position-controller';
import { SyncWindowSizeController } from '../../../app/app/components/window/controllers/sync-window-size-controller';
import { HandleKeyboardShortcutController } from '../../../app/app/components/app-shell/controllers/handle-keyboard-shortcut-controller';

@singleton()
export class InitializeWindowCallbacksOperation {
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
