import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemeHueReferenceHexOperation {
  constructor(private readonly ThemesStore: ThemesStore) {}

  execute(value: string): void {
    this.ThemesStore.getStore().setHueReferenceHex(value);
  }
}


