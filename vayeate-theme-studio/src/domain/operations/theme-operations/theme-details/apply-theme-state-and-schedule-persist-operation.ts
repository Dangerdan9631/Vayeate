import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { DebouncedThemePersistService } from '../../../../gateway/services/debounced-theme-persist-service';
import { ThemesStore } from '../../../state/theme/themes-store';

/** Updates in-memory theme, clears save error, and schedules debounced disk persist. */
@singleton()
export class ApplyThemeStateAndSchedulePersistOperation {
  constructor(
    private readonly themesStateSetter: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistService,
  ) {}

  execute(theme: Theme): void {
    this.themesStateSetter.getStore().setTheme(theme, true);
    this.themesStateSetter.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(theme);
  }
}
