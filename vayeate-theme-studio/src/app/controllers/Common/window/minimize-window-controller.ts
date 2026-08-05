import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../../../domain/operations/Common/window-operations/set-window-state-operation';
import { LoggerFactory, type Logger } from '../../../../domain/utils/Common/logger';
import { ValidateCanMinimizeWindow } from '../../../../domain/validations/Common/window-validations/validate-can-minimize-window';

/**
 * Minimizes the main window when validation allows it.
 */
@singleton()
export class MinimizeWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly validateCanMinimize: ValidateCanMinimizeWindow,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  /**
   * Skips minimize when the window is already minimized.
   */
  run(): void {
    if (!this.validateCanMinimize.test()) {
      this.log.warn('minimizeWindow skipped: validation failed (window already minimized)');
      return;
    }
    this.setWindowState.execute('minimize');
  }
}
