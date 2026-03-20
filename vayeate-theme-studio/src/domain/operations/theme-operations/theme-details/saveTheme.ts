import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { themeService } from '../../../../gateway/services/theme-service';

/** Persist theme to disk only. Single responsibility: save. */
@singleton()
export class SaveTheme {
  async execute(theme: Theme): Promise<void> {
    await themeService.saveTheme(theme);
  }
}

/** @deprecated Use SaveTheme class instead. */
export async function saveTheme(theme: Theme): Promise<void> {
  await themeService.saveTheme(theme);
}


