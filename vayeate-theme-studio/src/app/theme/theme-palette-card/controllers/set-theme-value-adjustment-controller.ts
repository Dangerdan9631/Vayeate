import { singleton } from 'tsyringe';
import { SetThemeValueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-value-adjustment-operation';

/**
 * Orchestrates set theme value adjustment work for the theme UI.
 */
@singleton()
export class SetThemeValueAdjustmentController {
  constructor(private readonly setThemeValueAdjustment: SetThemeValueAdjustmentOperation) {}

  /**
   * Validates input and invokes the domain operations for this interaction.
   * @param value Input for this call.
   * @param options Preview update options.
   */
  run(value: number, options?: { deferPreview?: boolean }): void {
    this.setThemeValueAdjustment.execute(value, options);
  }
}
