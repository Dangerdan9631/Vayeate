import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';

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
