import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/** Updates in-memory theme, clears save error, and schedules debounced disk persist. */
@singleton()
export class ApplyThemeStateAndSchedulePersistOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
    private readonly themeGateway: ThemeGateway,
  ) {}

  execute(theme: Theme): void {
    this.themeUiStore.getStore().setTheme(theme, true);
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(() => this.themeGateway.saveTheme(theme), (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
  }
}
