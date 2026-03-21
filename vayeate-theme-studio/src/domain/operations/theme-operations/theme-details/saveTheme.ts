import { container, injectable } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeService } from '../../../../gateway/services/theme-service';

/** Persist theme to disk only. Single responsibility: save. */
@injectable()
export class SaveTheme {
  constructor(private readonly themeService: ThemeService) {}

  async execute(theme: Theme): Promise<void> {
    await this.themeService.saveTheme(theme);
  }
}

/** @deprecated Use SaveTheme class instead. */
export async function saveTheme(theme: Theme): Promise<void> {
  await container.resolve(SaveTheme).execute(theme);
}


