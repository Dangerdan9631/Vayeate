import { singleton } from 'tsyringe';
import { SetThemeHueAdjustment } from '../../../operations/theme-operations';

@singleton()
export class SetThemeHueAdjustmentController {
  constructor(private readonly setThemeHueAdjustment: SetThemeHueAdjustment) {}

  run(value: number): void {
    this.setThemeHueAdjustment.execute(value);
  }
}
