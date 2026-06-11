import { singleton } from 'tsyringe';
import { SetThemeCreateDialogOpenOperation } from '../../../../domain/operations/theme-operations/theme-list/set-theme-create-dialog-open-operation';

/**
 * Orchestrates close theme create dialog work for the theme UI.
 */
@singleton()
export class CloseThemeCreateDialogController {
  constructor(private readonly setThemeCreateDialogOpen: SetThemeCreateDialogOpenOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @returns Promise resolved when orchestration completes.
   */
  run(): void {
    this.setThemeCreateDialogOpen.execute(false);
  }
}
