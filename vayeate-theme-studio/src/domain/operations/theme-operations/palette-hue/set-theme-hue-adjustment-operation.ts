import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetThemeHueAdjustmentOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(value: number): void {
    this.themeUiStore.getStore().setHueAdjustment(value);
  }
}


