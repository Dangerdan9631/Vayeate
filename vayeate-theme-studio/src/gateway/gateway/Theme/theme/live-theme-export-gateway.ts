import { singleton } from 'tsyringe';
import { stringifyThemeAsync } from '../../../../domain/operations/Theme/theme-operations/theme-utils/stringify-theme-operation';
import { generateThemePairAsync } from '../../../../domain/operations/Theme/theme-operations/theme-utils/theme-generator-operation';
import type { Theme } from '../../../../model/Theme/schema/theme-schemas';
import { FileSystemService } from '../../../services/Common/file-system-service';
import { TemplateGateway } from '../../Template/template/template-gateway';

/**
 * Package-relative directory for live VS Code theme JSON used by extension host debugging.
 */
export const LIVE_THEMES_EXPORT_PREFIX = 'temp/vscode-theme-preview/themes';
export const LIVE_DARK_THEME_FILE_NAME = 'active-color-theme.json';
export const LIVE_LIGHT_THEME_FILE_NAME = 'active-light-color-theme.json';

/**
 * Generates and writes the fixed dark/light files watched by the temporary preview extension.
 */
@singleton()
export class LiveThemeExportGateway {
  private enabled = false;

  constructor(
    private readonly templateGateway: TemplateGateway,
    private readonly fileSystemService: FileSystemService,
  ) {}

  /**
   * Enables live theme regeneration for the rest of the preview-host session.
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disables live regeneration after a failed host launch.
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Whether a preview host session is currently accepting live theme updates.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Regenerates both dark and light color-theme JSON files for the supplied theme snapshot.
   *
   * @param theme - Immutable theme snapshot to export.
   * @returns Resolves when both files are written, or immediately when the theme has no template.
   */
  async exportThemePair(theme: Theme): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const templateRef = theme.templateRef;
    if (!templateRef) {
      return;
    }

    const template = await this.templateGateway.loadTemplate(
      templateRef.name,
      templateRef.version,
    );
    if (!template) {
      throw new Error(
        `Template not found: ${templateRef.name} v${templateRef.version}`,
      );
    }

    const { dark, light } = await generateThemePairAsync(theme, template);
    const darkPath = `${LIVE_THEMES_EXPORT_PREFIX}/${LIVE_DARK_THEME_FILE_NAME}`;
    const lightPath = `${LIVE_THEMES_EXPORT_PREFIX}/${LIVE_LIGHT_THEME_FILE_NAME}`;
    const darkJson = await stringifyThemeAsync(dark);
    const lightJson = await stringifyThemeAsync(light);
    await this.fileSystemService.saveFile(darkPath, darkJson);
    await this.fileSystemService.saveFile(lightPath, lightJson);
  }
}
