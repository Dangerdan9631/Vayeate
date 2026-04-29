import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import type { HexColor } from '../../../../model/schema/primitives';

@singleton()
export class CommitHueReferenceEyeDropperColorController {
  constructor(
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
  ) {}

  async run(value: HexColor): Promise<void> {
    this.setThemeHueReferenceHex.execute(value);
    this.setThemeHueAdjustment.execute(0);
  }
}
