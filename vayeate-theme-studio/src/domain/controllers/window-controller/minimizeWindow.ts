import { singleton } from 'tsyringe';
import { SetWindowState } from '../../operations/window-operations';
import { AppStateGetter } from '../../state/app-state-getter';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { canMinimizeWindow } from '../../validations/window-validations';

@singleton()
export class MinimizeWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowState,
    private readonly appStateGetter: AppStateGetter,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  async run(): Promise<void> {
    if (!canMinimizeWindow(() => this.appStateGetter.current())) {
      this.log.warn('minimizeWindow skipped: validation failed (window already minimized)');
      return;
    }
    await this.setWindowState.execute('minimize');
  }
}
