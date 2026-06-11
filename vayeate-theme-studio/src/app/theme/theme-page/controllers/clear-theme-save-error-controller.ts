import { singleton } from 'tsyringe';
import { SetThemeSaveErrorOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-save-error-operation';

/**
 * Orchestrates clear theme save error work for the theme UI.
 */
@singleton()
export class ClearThemeSaveErrorController {
  constructor(private readonly setThemeSaveError: SetThemeSaveErrorOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @returns Promise resolved when orchestration completes.
   */
  run(): void {
    this.setThemeSaveError.execute(null);
  }
}
