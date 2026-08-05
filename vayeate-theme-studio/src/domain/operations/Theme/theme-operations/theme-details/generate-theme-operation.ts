import { singleton } from 'tsyringe';
import { FileSystemService } from '../../../../../gateway/services/Common/file-system-service';
import { TemplateGateway } from '../../../../../gateway/gateway/Template/template/template-gateway';
import { ThemeGateway } from '../../../../../gateway/gateway/Theme/theme/theme-gateway';
import { getCurrentTemplate, TemplatesStore } from '../../../../state/Template/data/templates-store';
import { getLoadedTheme } from '../../../../state/Theme/data/themes-state';
import { ThemesStore } from '../../../../state/Theme/data/themes-store';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../../Queue/background-queue/enqueue-background-queue-action-operation';
import { ValidateIsThemeFileNameValid } from '../../../../validations/Theme/theme-validations/validate-is-theme-file-name-valid';
import { stringifyThemeAsync } from '../theme-utils/stringify-theme-operation';
import { generateThemePairAsync } from '../theme-utils/theme-generator-operation';
import { toSafeFileName } from '../theme-utils/to-safe-theme-file-name-operation';

const EXTENSION_THEMES_EXPORT_PREFIX = 'exthemes';

/**
 * Generates theme and stores the result.
 */

@singleton()
export class GenerateThemeOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly templatesStore: TemplatesStore,
    private readonly themeGateway: ThemeGateway,
    private readonly templateGateway: TemplateGateway,
    private readonly fileSystemService: FileSystemService,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
    private readonly validateIsThemeFileNameValid: ValidateIsThemeFileNameValid,
  ) { }

  /**
   * Runs the generate theme mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    const { theme } = this.themeUiStore.getStore().state;
    const templateRef = theme?.templateRef;
    if (!theme || !templateRef) {
      return;
    }
    const themeName = theme.name;
    const themeVersion = theme.version;
    const templateName = templateRef.name;
    const templateVersion = templateRef.version;
    this.themeUiStore.getStore().setGenerateResult(null);
    this.enqueueBackgroundAction.execute(
      'deferred',
      `Generating theme ${themeName} ${themeVersion}`,
      async () => {
        try {
          const themeRef = { name: themeName, version: themeVersion };
          const templateRef = { name: templateName, version: templateVersion };
          const uiTheme = this.themeUiStore.getStore().state.theme;
          const themeForGeneration =
            uiTheme?.name === themeName && uiTheme.version === themeVersion
              ? uiTheme
              : getLoadedTheme(this.themesStore.getStore().state.themeMap, themeRef)
              ?? await this.themeGateway.loadTheme(themeName, themeVersion);
          if (!themeForGeneration) {
            throw new Error(`Theme not found: ${themeName} v${themeVersion}`);
          }
          const template =
            getCurrentTemplate(this.templatesStore.getStore().state.templates, templateRef)
            ?? await this.templateGateway.loadTemplate(templateName, templateVersion);
          if (!template) {
            throw new Error(`Template not found: ${templateName} v${templateVersion}`);
          }
          const { dark, light } = await generateThemePairAsync(themeForGeneration, template);
          const darkFileName = toSafeFileName(themeForGeneration.name, false);
          const lightFileName = toSafeFileName(themeForGeneration.name, true);
          if (!this.validateIsThemeFileNameValid.test(darkFileName)) {
            throw new Error(`Invalid theme output filename: ${darkFileName}`);
          }
          if (!this.validateIsThemeFileNameValid.test(lightFileName)) {
            throw new Error(`Invalid theme output filename: ${lightFileName}`);
          }
          const darkPath = `${EXTENSION_THEMES_EXPORT_PREFIX}/${darkFileName}`;
          const lightPath = `${EXTENSION_THEMES_EXPORT_PREFIX}/${lightFileName}`;
          await this.fileSystemService.saveFile(darkPath, await stringifyThemeAsync(dark));
          await this.fileSystemService.saveFile(lightPath, await stringifyThemeAsync(light));
          this.themeUiStore.getStore().setGenerateResult({
            success: true,
            message: `Generated ${darkPath} and ${lightPath}`,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          this.themeUiStore.getStore().setGenerateResult({ success: false, message });
        }
      }
    );
  }
}
