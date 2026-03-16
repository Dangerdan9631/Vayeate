import type { Theme } from '../../../../model/schemas';
import { themeService } from '../../../../gateway/services/theme-service';
import type { SetState } from '../types';

export async function createTheme(
  _setState: SetState,
  params: { name: string },
): Promise<Theme> {
  const theme = await themeService.createTheme(params);
  return theme;
}



