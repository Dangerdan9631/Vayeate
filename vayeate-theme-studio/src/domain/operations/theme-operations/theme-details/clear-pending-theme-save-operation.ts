import { singleton } from 'tsyringe';
import { DebouncedThemePersistService } from '../../../../gateway/services/debounced-theme-persist-service';

/** Clears debounced theme persist timer/state (used when restoring or bumping version). */
@singleton()
export class ClearPendingThemeSaveOperation {
  constructor(private readonly debouncedThemePersist: DebouncedThemePersistService) {}

  execute(): void {
    this.debouncedThemePersist.cancel();
  }
}
