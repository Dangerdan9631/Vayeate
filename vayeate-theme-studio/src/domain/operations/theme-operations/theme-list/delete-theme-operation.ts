import { container, injectable } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';

/** Delete one theme version from disk. Single responsibility: delete. */
@injectable()
export class DeleteThemeOperation {
  constructor(private readonly themeGateway: ThemeGateway) {}

  async execute(name: string, version: string): Promise<void> {
    await this.themeGateway.deleteTheme(name, version);
  }
}

/** @deprecated Use DeleteThemeOperation class instead. */
export async function deleteTheme(name: string, version: string): Promise<void> {
  await container.resolve(DeleteThemeOperation).execute(name, version);
}


