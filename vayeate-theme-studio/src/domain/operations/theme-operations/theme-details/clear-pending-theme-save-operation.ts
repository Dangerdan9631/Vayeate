import { singleton } from 'tsyringe';
import { clearPendingSave } from './debounced-theme-gateway-save';

/** Clears debounced theme persist timer/state (used when restoring or bumping version). */
@singleton()
export class ClearPendingThemeSaveOperation {
  execute(): void {
    clearPendingSave();
  }
}
