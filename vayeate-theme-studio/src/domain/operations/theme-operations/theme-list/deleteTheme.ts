import { container, injectable } from 'tsyringe';
import { ThemeService } from '../../../../gateway/services/theme-service';

/** Delete one theme version from disk. Single responsibility: delete. */
@injectable()
export class DeleteTheme {
  constructor(private readonly themeService: ThemeService) {}

  async execute(name: string, version: string): Promise<void> {
    await this.themeService.deleteTheme(name, version);
  }
}

/** @deprecated Use DeleteTheme class instead. */
export async function deleteTheme(name: string, version: string): Promise<void> {
  await container.resolve(DeleteTheme).execute(name, version);
}


