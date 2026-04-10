import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';

/** Delete one theme version from disk. Single responsibility: delete. */
@singleton()
export class DeleteThemeOperation {
  constructor(private readonly themeGateway: ThemeGateway) {}

  async execute(name: string, version: string): Promise<void> {
    await this.themeGateway.deleteTheme(name, version);
  }
}
