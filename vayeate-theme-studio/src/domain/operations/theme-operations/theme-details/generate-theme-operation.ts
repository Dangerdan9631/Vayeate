import { singleton } from 'tsyringe';
import { FileSystemService } from '../../../../gateway/services/file-system-service';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { getCurrentTemplate, TemplatesStore } from '../../../state/data/templates-store';
import { getLoadedTheme } from '../../../state/data/themes-state';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { assertValidThemeFileName } from '../../../utils/assert-valid-theme-file-name';
import { stringifyTheme } from '../../../utils/stringify-theme';
import { generateThemePair } from '../../../utils/theme-generator';
import { toSafeFileName } from '../../../utils/to-safe-theme-file-name';

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
      'worker',
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
          const { dark, light } = generateThemePair(themeForGeneration, template);
          const darkFileName = toSafeFileName(themeForGeneration.name, false);
          const lightFileName = toSafeFileName(themeForGeneration.name, true);
          assertValidThemeFileName(darkFileName);
          assertValidThemeFileName(lightFileName);
          const darkPath = `${EXTENSION_THEMES_EXPORT_PREFIX}/${darkFileName}`;
          const lightPath = `${EXTENSION_THEMES_EXPORT_PREFIX}/${lightFileName}`;
          await this.fileSystemService.saveFile(darkPath, stringifyTheme(dark));
          await this.fileSystemService.saveFile(lightPath, stringifyTheme(light));
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
