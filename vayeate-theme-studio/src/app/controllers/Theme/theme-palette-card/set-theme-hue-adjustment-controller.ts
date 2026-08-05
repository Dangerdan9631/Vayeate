import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/Theme/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { CommitPendingPaletteAdjustmentOperation } from '../../../../domain/operations/Theme/theme-operations/theme-pane-selection/commit-pending-palette-adjustment-operation';

/**
 * Orchestrates set theme hue adjustment work for the theme UI.
 */
@singleton()
export class SetThemeHueAdjustmentController {
  constructor(
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly commitPendingPaletteAdjustment: CommitPendingPaletteAdjustmentOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param value Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  run(value: number, options?: { deferPreview?: boolean }): void {
    this.setThemeHueAdjustment.execute(value, options);
    if (!options?.deferPreview) {
      this.commitPendingPaletteAdjustment.execute();
    }
  }
}
