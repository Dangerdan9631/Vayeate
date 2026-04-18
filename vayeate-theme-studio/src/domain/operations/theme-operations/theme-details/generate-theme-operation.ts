import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Generate theme files via service and report result in state. */
@singleton()
export class GenerateThemeOperation {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly themesStateSetter: ThemesStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(): void {
    const { theme } = this.themesStateGetter.getStore().state;
    const templateRef = theme?.templateRef;
    if (!theme || !templateRef) {
      return;
    }
    const themeName = theme.name;
    const themeVersion = theme.version;
    const templateName = templateRef.name;  
    const templateVersion = templateRef.version;
    this.themesStateSetter.getStore().setGenerateResult(null);
    this.enqueueBackgroundAction.execute(async() => {
      try {
        const { darkPath, lightPath } = await this.themeGateway.generateTheme(
          themeName,
          themeVersion,
          templateName,
          templateVersion,
        );
        this.themesStateSetter.getStore().setGenerateResult({
          success: true,
          message: `Generated ${darkPath} and ${lightPath}`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.themesStateSetter.getStore().setGenerateResult({ success: false, message });
      }
    }, `Generating theme ${themeName} ${themeVersion}`);
  }
}
