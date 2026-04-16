import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemeHueAdjustmentOperation {
  constructor(private readonly ThemesStore: ThemesStore) {}

  execute(value: number): void {
    this.ThemesStore.getStore().setHueAdjustment(value);
  }
}


