import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { ApplyThemeStateOperation } from './apply-theme-state-operation';

/**
 * Updates in-memory theme, clears save error, and schedules debounced disk persist.
 */
@singleton()
export class ApplyThemeStateAndSchedulePersistOperation {
  constructor(
    private readonly applyThemeState: ApplyThemeStateOperation,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
    private readonly themeUiStore: ThemeUiStore,
  ) {}

  /**
   * Runs the apply theme state and schedule persist mutation.
   * @param theme Theme (Theme).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(theme: Theme): void {
    this.applyThemeState.execute(theme);
    this.debouncedThemePersist.schedule(theme, (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
  }
}
