import { singleton } from 'tsyringe';
import { SetThemeSaturationAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-saturation-adjustment-operation';

/**
 * Orchestrates set theme saturation adjustment work for the theme UI.
 */
@singleton()
export class SetThemeSaturationAdjustmentController {
  constructor(private readonly setThemeSaturationAdjustment: SetThemeSaturationAdjustmentOperation) {}

  /**
   * Validates input and invokes the domain operations for this interaction.
   * @param value Input for this call.
   * @param options Preview update options.
   */
  run(value: number, options?: { deferPreview?: boolean }): void {
    this.setThemeSaturationAdjustment.execute(value, options);
  }
}
