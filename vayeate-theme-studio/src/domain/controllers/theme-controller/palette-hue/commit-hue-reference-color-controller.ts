import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation, SetThemeHueReferenceHexOperation } from '../../../operations/theme-operations';

@singleton()
export class CommitHueReferenceColorController {
  constructor(
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
  ) {}

  run(value: string): void {
    this.setThemeHueReferenceHex.execute(value);
    this.setThemeHueAdjustment.execute(0);
  }
}
