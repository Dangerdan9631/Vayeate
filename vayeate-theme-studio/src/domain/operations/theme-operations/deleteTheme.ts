import { themeService } from '../../../gateway/services/theme-service';

/** Delete one theme version from disk. Single responsibility: delete. */
export async function deleteTheme(name: string, version: string): Promise<void> {
  await themeService.deleteTheme(name, version);
}
