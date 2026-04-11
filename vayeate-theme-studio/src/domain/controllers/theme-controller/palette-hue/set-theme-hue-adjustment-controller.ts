import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';

@singleton()
export class SetThemeHueAdjustmentController {
  constructor(private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation) {}

  async run(value: number): Promise<void> {
    this.setThemeHueAdjustment.execute(value);
  }
}
