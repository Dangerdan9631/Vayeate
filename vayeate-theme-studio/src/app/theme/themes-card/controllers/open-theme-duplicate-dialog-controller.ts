import { singleton } from 'tsyringe';
import { SetThemeCreateDialogModeOperation } from '../../../../domain/operations/theme-operations/theme-list/set-theme-create-dialog-mode-operation';
import { SetThemeCreateDialogOpenOperation } from '../../../../domain/operations/theme-operations/theme-list/set-theme-create-dialog-open-operation';
import { SetThemeCreateFormNameOperation } from '../../../../domain/operations/theme-operations/theme-list/set-theme-create-form-name-operation';

/**
 * Orchestrates open theme duplicate dialog work for the theme UI.
 */
@singleton()
export class OpenThemeDuplicateDialogController {
  constructor(
    private readonly setThemeCreateDialogMode: SetThemeCreateDialogModeOperation,
    private readonly setThemeCreateDialogOpen: SetThemeCreateDialogOpenOperation,
    private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation,
  ) {}

  /**
   * Validates input and invokes the domain operations for this interaction.
   * @returns Promise resolved when orchestration completes.
   */
  run(): void {
    this.setThemeCreateDialogMode.execute('duplicate');
    this.setThemeCreateFormName.execute('');
    this.setThemeCreateDialogOpen.execute(true);
  }
}
