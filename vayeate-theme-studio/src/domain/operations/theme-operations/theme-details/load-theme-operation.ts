import { container, injectable } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@injectable()
export class LoadThemeOperation {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly themeGateway: ThemeGateway,
  ) {}

  async execute(name: string, version: string): Promise<Theme | null> {
    const loaded = await this.themeGateway.loadTheme(name, version);
    this.appStateSetter.apply({ type: 'SET_THEME', theme: loaded });
    return loaded;
  }
}

/** @deprecated Use LoadThemeOperation class instead. */
export async function loadTheme(
  setState: (update: AppStateUpdate) => void,
  name: string,
  version: string,
): Promise<Theme | null> {
  const loaded = await container.resolve(ThemeGateway).loadTheme(name, version);
  setState({ type: 'SET_THEME', theme: loaded });
  return loaded;
}



