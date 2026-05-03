import { singleton } from 'tsyringe';
import { FileSystemService } from '../../../../gateway/services/file-system-service';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { assertValidThemeFileName } from '../../../utils/assert-valid-theme-file-name';
import { stringifyTheme } from '../../../utils/stringify-theme';
import { generateThemePair } from '../../../utils/theme-generator';
import { toSafeFileName } from '../../../utils/to-safe-theme-file-name';

const EXTENSION_THEMES_EXPORT_PREFIX = 'exthemes';

/** Generate theme files via service and report result in state. */
@singleton()
export class GenerateThemeOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themeGateway: ThemeGateway,
    private readonly templateGateway: TemplateGateway,
    private readonly fileSystemService: FileSystemService,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

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
      `Generating theme ${themeName} ${themeVersion}`,
      async () => {
        try {
          const persistedTheme = await this.themeGateway.loadTheme(themeName, themeVersion);
          if (!persistedTheme) {
            throw new Error(`Theme not found: ${themeName} v${themeVersion}`);
          }
          const template = await this.templateGateway.loadTemplate(templateName, templateVersion);
          if (!template) {
            throw new Error(`Template not found: ${templateName} v${templateVersion}`);
          }
          const { dark, light } = generateThemePair(persistedTheme, template);
          const darkFileName = toSafeFileName(persistedTheme.name, false);
          const lightFileName = toSafeFileName(persistedTheme.name, true);
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
