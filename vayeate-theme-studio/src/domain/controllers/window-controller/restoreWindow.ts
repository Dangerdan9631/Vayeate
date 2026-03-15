import { restoreWindow as restoreWindowOp } from '../../operations/window-operations';
import type { AppState } from '../../state/app-state';
import { createLogger } from '../../utils/logger';
import { canRestoreWindow } from '../../validations/window-validations';

const log = createLogger('WindowController');

export type GetState = () => AppState;

export async function restoreWindow(getState: GetState): Promise<void> {
  if (!canRestoreWindow(getState)) {
    log.warn('restoreWindow skipped: validation failed (window not maximized or minimized)');
    return;
  }
  await restoreWindowOp();
}
