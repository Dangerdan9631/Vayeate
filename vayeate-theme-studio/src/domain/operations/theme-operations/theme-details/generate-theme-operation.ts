import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

/** Generate theme files via service and report result in state. */
@singleton()
export class GenerateThemeOperation {
  constructor(
    private readonly themesStateSetter: ThemesStateSetter,
    private readonly themeGateway: ThemeGateway,
  ) {}

  async execute(
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ): Promise<void> {
    this.themesStateSetter.apply({ type: 'SET_GENERATE_RESULT', result: null });
    try {
      const { darkPath, lightPath } = await this.themeGateway.generateTheme(
        themeName,
        themeVersion,
        templateName,
        templateVersion,
      );
      this.themesStateSetter.apply({
        type: 'SET_GENERATE_RESULT',
        result: {
          success: true,
          message: `Generated ${darkPath} and ${lightPath}`,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.themesStateSetter.apply({ type: 'SET_GENERATE_RESULT', result: { success: false, message } });
    }
  }
}
