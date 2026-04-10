import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import { scheduleDebouncedThemePersist } from './debounced-theme-gateway-save';

/** Updates in-memory theme, clears save error, and schedules debounced disk persist. */
@singleton()
export class ApplyThemeStateAndSchedulePersistOperation {
  constructor(
    private readonly themesStateSetter: ThemesStateSetter,
    private readonly themeGateway: ThemeGateway,
  ) {}

  execute(theme: Theme): void {
    this.themesStateSetter.apply({ type: 'SET_THEME', theme, preserveHue: true });
    this.themesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error: null });
    scheduleDebouncedThemePersist(this.themeGateway, this.themesStateSetter, theme);
  }
}
