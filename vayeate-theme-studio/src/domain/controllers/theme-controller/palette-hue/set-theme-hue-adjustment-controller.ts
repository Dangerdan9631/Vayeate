import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../operations/theme-operations';

@singleton()
export class SetThemeHueAdjustmentController {
  constructor(private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation) {}

  run(value: number): void {
    this.setThemeHueAdjustment.execute(value);
  }
}
