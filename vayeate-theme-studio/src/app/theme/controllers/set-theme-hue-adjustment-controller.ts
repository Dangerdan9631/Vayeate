import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';

@singleton()
export class SetThemeHueAdjustmentController {
  constructor(private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation) {}

  run(value: number): void {
    this.setThemeHueAdjustment.execute(value);
  }
}
