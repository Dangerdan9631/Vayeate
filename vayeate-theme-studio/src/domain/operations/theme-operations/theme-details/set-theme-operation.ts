import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemeOperation {
  constructor(private readonly ThemesStore: ThemesStore) {}

  execute(theme: Theme | null, preserveHue?: boolean): void {
    this.ThemesStore.getStore().setTheme(theme, preserveHue);
  }
}


