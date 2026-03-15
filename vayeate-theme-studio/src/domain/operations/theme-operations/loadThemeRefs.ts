import type { ThemeReference } from '../../../model/schemas';
import { themeService } from '../../../gateway/services/theme-service';
import type { SetState } from './types';

export async function loadThemeRefs(setState: SetState): Promise<ThemeReference[]> {
  const refs = await themeService.listThemes();
  setState({ type: 'SET_THEME_REFS', refs });
  return refs;
}
