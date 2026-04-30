import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { DebouncedThemePersistService } from '../../../../gateway/services/debounced-theme-persist-service';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/theme/themes-store';

/** Updates in-memory theme, clears save error, and schedules debounced disk persist. */
@singleton()
export class ApplyThemeStateAndSchedulePersistOperation {
  constructor(
    private readonly themesStateSetter: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistService,
    private readonly themeGateway: ThemeGateway,
  ) {}

  execute(theme: Theme): void {
    this.themesStateSetter.getStore().setTheme(theme, true);
    this.themesStateSetter.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(() => this.themeGateway.saveTheme(theme), (message) => {
      this.themesStateSetter.getStore().setSaveError(message);
    });
  }
}
