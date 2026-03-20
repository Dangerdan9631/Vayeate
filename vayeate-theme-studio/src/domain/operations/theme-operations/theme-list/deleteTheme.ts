import { singleton } from 'tsyringe';
import { themeService } from '../../../../gateway/services/theme-service';

/** Delete one theme version from disk. Single responsibility: delete. */
@singleton()
export class DeleteTheme {
  async execute(name: string, version: string): Promise<void> {
    await themeService.deleteTheme(name, version);
  }
}

/** @deprecated Use DeleteTheme class instead. */
export async function deleteTheme(name: string, version: string): Promise<void> {
  await themeService.deleteTheme(name, version);
}


