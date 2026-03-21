import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { themeService } from '../../../../gateway/services/theme-service';
import type { AppStateUpdate } from '../../../state/app-state';

@singleton()
export class CreateTheme {
  async execute(params: { name: string }): Promise<Theme> {
    return await themeService.createTheme(params);
  }
}

/** @deprecated Use CreateTheme class instead. */
export async function createTheme(
  _setState: (update: AppStateUpdate) => void,
  params: { name: string },
): Promise<Theme> {
  const theme = await themeService.createTheme(params);
  return theme;
}



