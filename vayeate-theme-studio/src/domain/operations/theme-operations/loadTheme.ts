import type { Theme } from '../../../model/schemas';
import { themeService } from '../../../gateway/services/theme-service';
import type { SetState } from './types';

export async function loadTheme(
  setState: SetState,
  name: string,
  version: string,
): Promise<Theme | null> {
  const loaded = await themeService.loadTheme(name, version);
  setState({ type: 'SET_THEME', theme: loaded });
  return loaded;
}
