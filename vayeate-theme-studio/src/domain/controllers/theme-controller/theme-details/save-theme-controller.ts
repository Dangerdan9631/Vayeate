import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SaveThemeOperation, SetThemeOperation, SetThemeSaveErrorOperation } from '../../../operations/theme-operations';
import { scheduleDebouncedSave } from '../theme-list/theme-save-state';

@singleton()
export class SaveThemeController {
  constructor(
    private readonly setTheme: SetThemeOperation,
    private readonly setThemeSaveError: SetThemeSaveErrorOperation,
    private readonly saveTheme: SaveThemeOperation,
  ) {}

  run(theme: Theme): void {
    this.setTheme.execute(theme, true);
    this.setThemeSaveError.execute(null);
    scheduleDebouncedSave(this.saveTheme, this.setThemeSaveError, theme);
  }
}
