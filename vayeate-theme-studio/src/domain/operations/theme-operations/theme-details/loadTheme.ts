import { container, injectable } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeService } from '../../../../gateway/services/theme-service';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@injectable()
export class LoadTheme {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly themeService: ThemeService,
  ) {}

  async execute(name: string, version: string): Promise<Theme | null> {
    const loaded = await this.themeService.loadTheme(name, version);
    this.appStateSetter.apply({ type: 'SET_THEME', theme: loaded });
    return loaded;
  }
}

/** @deprecated Use LoadTheme class instead. */
export async function loadTheme(
  setState: (update: AppStateUpdate) => void,
  name: string,
  version: string,
): Promise<Theme | null> {
  const loaded = await container.resolve(ThemeService).loadTheme(name, version);
  setState({ type: 'SET_THEME', theme: loaded });
  return loaded;
}



