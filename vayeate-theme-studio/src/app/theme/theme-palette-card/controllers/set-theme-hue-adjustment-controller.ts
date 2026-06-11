import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';

/**
 * Orchestrates set theme hue adjustment work for the theme UI.
 */
@singleton()
export class SetThemeHueAdjustmentController {
  constructor(private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param value Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  run(value: number): void {
    this.setThemeHueAdjustment.execute(value);
  }
}
