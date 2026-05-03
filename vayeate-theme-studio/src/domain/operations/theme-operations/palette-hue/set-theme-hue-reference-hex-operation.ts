import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetThemeHueReferenceHexOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(value: string): void {
    this.themeUiStore.getStore().setHueReferenceHex(value);
  }
}


