import { singleton } from 'tsyringe';
import { SetThemeCreateFormNameOperation } from '../../../../domain/operations/theme-operations/theme-list/set-theme-create-form-name-operation';

/**
 * Orchestrates set theme create form name work for the theme UI.
 */
@singleton()
export class SetThemeCreateFormNameController {
  constructor(private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param value Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  run(value: string): void {
    this.setThemeCreateFormName.execute(value);
  }
}
