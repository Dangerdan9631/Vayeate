import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { singleton } from 'tsyringe';
import { ThemesStateGetter, ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Generate theme files via service and report result in state. */
@singleton()
export class GenerateThemeOperation {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly themesStateSetter: ThemesStateSetter,
    private readonly themeGateway: ThemeGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    const { theme } = this.themesStateGetter.current();
    const templateRef = theme?.templateRef;
    if (!theme || !templateRef) {
      return;
    }
    const themeName = theme.name;
    const themeVersion = theme.version;
    const templateName = templateRef.name;  
    const templateVersion = templateRef.version;
    this.themesStateSetter.apply({ type: 'SET_GENERATE_RESULT', result: null });
    this.backgroundQueueGateway.enqueue(async() => {
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
    }, `Generating theme ${themeName} ${themeVersion}`);
  }
}
