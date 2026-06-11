import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';

/**
 * Clears debounced theme persist timer/state (used when restoring or bumping version).
 */
@singleton()
export class ClearPendingThemeSaveOperation {
  constructor(private readonly debouncedThemePersist: DebouncedThemePersistGateway) {}

  /**
   * Runs the clear pending theme save mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.debouncedThemePersist.cancel();
  }
}
