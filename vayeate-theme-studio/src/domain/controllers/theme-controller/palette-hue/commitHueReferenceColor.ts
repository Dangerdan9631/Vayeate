import { singleton } from 'tsyringe';
import { SetThemeHueAdjustment, SetThemeHueReferenceHex } from '../../../operations/theme-operations';

@singleton()
export class CommitHueReferenceColorController {
  constructor(
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHex,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustment,
  ) {}

  run(value: string): void {
    this.setThemeHueReferenceHex.execute(value);
    this.setThemeHueAdjustment.execute(0);
  }
}
