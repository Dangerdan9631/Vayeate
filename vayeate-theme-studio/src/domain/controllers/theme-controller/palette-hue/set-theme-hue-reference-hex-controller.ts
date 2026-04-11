import { singleton } from 'tsyringe';
import { SetThemeHueReferenceHexOperation } from '../../../operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';

@singleton()
export class SetThemeHueReferenceHexController {
  constructor(private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation) {}

  async run(value: string): Promise<void> {
    this.setThemeHueReferenceHex.execute(value);
  }
}
