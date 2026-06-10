import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/** Updates in-memory theme and clears save error without scheduling disk persist. */
@singleton()
export class ApplyThemeStateOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(theme: Theme): void {
    this.themeUiStore.getStore().setTheme(theme, true);
    this.themeUiStore.getStore().setSaveError(null);
  }
}
