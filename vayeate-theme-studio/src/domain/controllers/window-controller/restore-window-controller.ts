import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations';
import { WindowStateGetter } from '../../state/window/window-state-reducer';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { canRestoreWindow } from '../../validations/window-validations';

@singleton()
export class RestoreWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly windowStateGetter: WindowStateGetter,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  async run(): Promise<void> {
    if (!canRestoreWindow(() => this.windowStateGetter.current())) {
      this.log.warn('restoreWindow skipped: validation failed (window not maximized or minimized)');
      return;
    }
    await this.setWindowState.execute('restore');
  }
}
