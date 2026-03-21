import { singleton } from 'tsyringe';
import { GenerateTheme } from '../../../operations/theme-operations';

@singleton()
export class GenerateThemeController {
  constructor(private readonly generateTheme: GenerateTheme) {}

  async run(
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ): Promise<void> {
    await this.generateTheme.execute(themeName, themeVersion, templateName, templateVersion);
  }
}
