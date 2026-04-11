import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { DebouncedThemePersistService } from '../../../../gateway/services/debounced-theme-persist-service';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

/** Updates in-memory theme, clears save error, and schedules debounced disk persist. */
@singleton()
export class ApplyThemeStateAndSchedulePersistOperation {
  constructor(
    private readonly themesStateSetter: ThemesStateSetter,
    private readonly debouncedThemePersist: DebouncedThemePersistService,
  ) {}

  execute(theme: Theme): void {
    this.themesStateSetter.apply({ type: 'SET_THEME', theme, preserveHue: true });
    this.themesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error: null });
    this.debouncedThemePersist.schedule(theme);
  }
}
