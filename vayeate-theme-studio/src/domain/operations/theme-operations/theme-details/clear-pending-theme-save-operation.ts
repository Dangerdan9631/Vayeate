import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';

/** Clears debounced theme persist timer/state (used when restoring or bumping version). */
@singleton()
export class ClearPendingThemeSaveOperation {
  constructor(private readonly debouncedThemePersist: DebouncedThemePersistGateway) {}

  execute(): void {
    this.debouncedThemePersist.cancel();
  }
}
