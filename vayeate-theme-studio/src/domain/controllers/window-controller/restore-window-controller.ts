import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations';
import { AppStateGetter } from '../../state/app-state-getter';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { canRestoreWindow } from '../../validations/window-validations';

@singleton()
export class RestoreWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly appStateGetter: AppStateGetter,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  async run(): Promise<void> {
    if (!canRestoreWindow(() => this.appStateGetter.current())) {
      this.log.warn('restoreWindow skipped: validation failed (window not maximized or minimized)');
      return;
    }
    await this.setWindowState.execute('restore');
  }
}
