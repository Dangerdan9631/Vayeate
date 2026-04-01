import { singleton } from 'tsyringe';
import { SetThemeHueReferenceHexOperation } from '../../../operations/theme-operations';

@singleton()
export class SetThemeHueReferenceHexController {
  constructor(private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation) {}

  run(value: string): void {
    this.setThemeHueReferenceHex.execute(value);
  }
}
