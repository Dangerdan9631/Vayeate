import { singleton } from 'tsyringe';
import { SetThemeHueReferenceHexOperation } from '../../../operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';

@singleton()
export class SetThemeHueReferenceHexController {
  constructor(private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation) {}

  run(value: string): void {
    this.setThemeHueReferenceHex.execute(value);
  }
}
