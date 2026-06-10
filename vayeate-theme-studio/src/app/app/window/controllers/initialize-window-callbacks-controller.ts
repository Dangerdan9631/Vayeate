import { singleton } from 'tsyringe';
import { WindowCallbacksPort } from '../../../../domain/operations/app-operations/window-callbacks-port';
import { SetViewportSizeOperation } from '../../../../domain/operations/window-operations/set-viewport-size-operation';
import { SetWindowDisplayStateOperation } from '../../../../domain/operations/window-operations/set-window-display-state-operation';
import { SetWindowPositionOperation } from '../../../../domain/operations/window-operations/set-window-position-operation';
import { SetWindowSizeOperation } from '../../../../domain/operations/window-operations/set-window-size-operation';
import { HandleKeyboardShortcutController } from '../../app-shell/controllers/handle-keyboard-shortcut-controller';

@singleton()
export class InitializeWindowCallbacksController {
  constructor(
    private readonly windowCallbacks: WindowCallbacksPort,
    private readonly setWindowDisplayState: SetWindowDisplayStateOperation,
    private readonly setWindowSize: SetWindowSizeOperation,
    private readonly setWindowPosition: SetWindowPositionOperation,
    private readonly setViewportSize: SetViewportSizeOperation,
    private readonly handleKeyboardShortcut: HandleKeyboardShortcutController,
  ) {}

  run(): void {
    this.windowCallbacks.initialize({
      onStateEvent: (event) => {
        this.setWindowDisplayState.execute(event);
      },
      onResize: (size) => {
        this.setWindowSize.execute(size);
      },
      onMove: (position) => {
        this.setWindowPosition.execute(position);
      },
      onViewportResize: (size) => {
        this.setViewportSize.execute(size);
      },
      onGlobalKeyDown: (event) => {
        void this.handleKeyboardShortcut.run(event);
      },
    });
  }
}
