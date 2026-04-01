import { container, injectable } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';

/** Persist theme to disk only. Single responsibility: save. */
@injectable()
export class SaveThemeOperation {
  constructor(private readonly themeGateway: ThemeGateway) {}

  async execute(theme: Theme): Promise<void> {
    await this.themeGateway.saveTheme(theme);
  }
}

/** @deprecated Use SaveThemeOperation class instead. */
export async function saveTheme(theme: Theme): Promise<void> {
  await container.resolve(SaveThemeOperation).execute(theme);
}


