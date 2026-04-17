import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';

@singleton()
export class CreateThemeOperation {
  constructor(private readonly themeGateway: ThemeGateway) {}

  async execute(params: { name: string }): Promise<Theme> {
    return await this.themeGateway.createTheme(params);
  }
}
