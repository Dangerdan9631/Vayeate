import { container, injectable } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

@injectable()
export class LoadThemeOperation {
  constructor(
    private readonly ThemesStateSetter: ThemesStateSetter,
    private readonly themeGateway: ThemeGateway,
  ) {}

  async execute(name: string, version: string): Promise<Theme | null> {
    const loaded = await this.themeGateway.loadTheme(name, version);
    this.ThemesStateSetter.apply({ type: 'SET_THEME', theme: loaded });
    return loaded;
  }
}

/** @deprecated Use LoadThemeOperation class instead. */
export async function loadTheme(
  setState: (update: ThemesStateUpdate) => void,
  name: string,
  version: string,
): Promise<Theme | null> {
  const loaded = await container.resolve(ThemeGateway).loadTheme(name, version);
  setState({ type: 'SET_THEME', theme: loaded });
  return loaded;
}



