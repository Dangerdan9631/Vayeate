import { singleton } from 'tsyringe';
import { SetWindowState } from '../../operations/window-operations';
import { AppStateGetter } from '../../state/app-state-getter';
import { createLogger } from '../../utils/logger';
import { canRestoreWindow } from '../../validations/window-validations';

const log = createLogger('WindowController');

@singleton()
export class RestoreWindowController {
  constructor(
    private readonly setWindowState: SetWindowState,
    private readonly appStateGetter: AppStateGetter,
  ) {}

  async run(): Promise<void> {
    if (!canRestoreWindow(() => this.appStateGetter.current())) {
      log.warn('restoreWindow skipped: validation failed (window not maximized or minimized)');
      return;
    }
    await this.setWindowState.execute('restore');
  }
}
