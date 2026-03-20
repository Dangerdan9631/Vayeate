import { singleton } from 'tsyringe';
import { MinimizeWindow } from '../../operations/window-operations';
import { AppStateGetter } from '../../state/app-state-getter';
import { createLogger } from '../../utils/logger';
import { canMinimizeWindow } from '../../validations/window-validations';

const log = createLogger('WindowController');

@singleton()
export class MinimizeWindowController {
  constructor(
    private readonly minimizeWindow: MinimizeWindow,
    private readonly appStateGetter: AppStateGetter,
  ) {}

  async run(): Promise<void> {
    if (!canMinimizeWindow(() => this.appStateGetter.current())) {
      log.warn('minimizeWindow skipped: validation failed (window already minimized)');
      return;
    }
    await this.minimizeWindow.execute();
  }
}
