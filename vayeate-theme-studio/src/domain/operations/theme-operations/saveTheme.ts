import type { Theme } from '../../../model/schemas';
import { themeService } from '../../../gateway/services/theme-service';

/** Persist theme to disk only. Single responsibility: save. */
export async function saveTheme(theme: Theme): Promise<void> {
  await themeService.saveTheme(theme);
}
