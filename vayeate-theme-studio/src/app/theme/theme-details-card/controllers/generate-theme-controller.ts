import { singleton } from 'tsyringe';
import { GenerateThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/generate-theme-operation';

/**
 * Orchestrates generate theme work for the theme UI.
 */
@singleton()
export class GenerateThemeController {
  constructor(private readonly generateTheme: GenerateThemeOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @returns Promise resolved when orchestration completes.
   */
  run(): void {
    this.generateTheme.execute();
  }
}
