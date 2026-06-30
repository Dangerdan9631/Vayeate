import { singleton } from 'tsyringe';
import { SetThemeVariablesSearchTextOperation } from '../../../../domain/operations/theme-operations/variables/set-theme-variables-search-text-operation';

/**
 * Orchestrates set theme variables search text work for the theme UI.
 */
@singleton()
export class SetThemeVariablesSearchTextController {
  constructor(private readonly setThemeVariablesSearchText: SetThemeVariablesSearchTextOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param value Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  run(value: string): void {
    this.setThemeVariablesSearchText.execute(value);
  }
}
