import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class LoadThemeOperation {
  constructor(
    private readonly ThemesStore: ThemesStore,
    private readonly themeGateway: ThemeGateway,
  ) {}

  async execute(name: string, version: string): Promise<Theme | null> {
    const loaded = await this.themeGateway.loadTheme(name, version);
    this.ThemesStore.getStore().setTheme(loaded);
    return loaded;
  }
}


