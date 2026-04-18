import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations/set-window-state-operation';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { ValidateCanMinimizeWindow } from '../../validations/window-validations/validate-can-minimize-window';

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

  run(): void {
    if (!this.validateCanMinimize.test()) {
      this.log.warn('minimizeWindow skipped: validation failed (window already minimized)');
      return;
    }
    this.setWindowState.execute('minimize');
  }
}
