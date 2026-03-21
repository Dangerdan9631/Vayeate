import { singleton } from 'tsyringe';
import { SetThemeHueReferenceHex } from '../../../operations/theme-operations';

@singleton()
export class SetThemeHueReferenceHexController {
  constructor(private readonly setThemeHueReferenceHex: SetThemeHueReferenceHex) {}

  run(value: string): void {
    this.setThemeHueReferenceHex.execute(value);
  }
}
