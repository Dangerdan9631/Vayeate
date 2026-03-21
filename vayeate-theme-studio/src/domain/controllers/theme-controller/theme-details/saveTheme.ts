import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SaveTheme, SetTheme, SetThemeSaveError } from '../../../operations/theme-operations';
import { scheduleDebouncedSave } from '../theme-list/theme-save-state';

@singleton()
export class SaveThemeController {
  constructor(
    private readonly setTheme: SetTheme,
    private readonly setThemeSaveError: SetThemeSaveError,
    private readonly saveTheme: SaveTheme,
  ) {}

  run(theme: Theme): void {
    this.setTheme.execute(theme, true);
    this.setThemeSaveError.execute(null);
    scheduleDebouncedSave(this.saveTheme, this.setThemeSaveError, theme);
  }
}
