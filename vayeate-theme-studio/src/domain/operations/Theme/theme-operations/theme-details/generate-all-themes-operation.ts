import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../../gateway/gateway/Template/template/template-gateway';
import { ThemeGateway } from '../../../../../gateway/gateway/Theme/theme/theme-gateway';
import { FileSystemService } from '../../../../../gateway/services/Common/file-system-service';
import type {
  ThemeBatchBuildResult,
  ThemeBuildFailure,
} from '../../../../../model/Theme/theme-build';
import { ValidateIsThemeFileNameValid } from '../../../../validations/Theme/theme-validations/validate-is-theme-file-name-valid';
import { generateThemePairAsync } from '../theme-utils/theme-generator-operation';
import { stringifyThemeAsync } from '../theme-utils/stringify-theme-operation';
import { toSafeFileName } from '../theme-utils/to-safe-theme-file-name-operation';
import { latestThemeReferences } from './latest-theme-references-operation';

const EXTENSION_THEMES_EXPORT_PREFIX = 'exthemes';

/**
 * Generates dark and light VS Code themes from the latest file for every theme name.
 */
@singleton()
export class GenerateAllThemesOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly templateGateway: TemplateGateway,
    private readonly fileSystemService: FileSystemService,
    private readonly validateIsThemeFileNameValid: ValidateIsThemeFileNameValid,
  ) {}

  /**
   * Generates and writes all latest theme pairs.
   *
   * @returns Batch result including successful paths and per-theme failures.
   */
  async execute(): Promise<ThemeBatchBuildResult> {
    const outputPaths: string[] = [];
    const failures: ThemeBuildFailure[] = [];
    let generatedCount = 0;
    const references = latestThemeReferences(await this.themeGateway.listThemes());

    for (const reference of references) {
      try {
        const theme = await this.themeGateway.loadTheme(reference.name, reference.version);
        if (!theme) {
          throw new Error('Theme file is missing or invalid');
        }
        if (!theme.templateRef) {
          throw new Error('Theme does not reference a template');
        }
        const template = await this.templateGateway.loadTemplate(
          theme.templateRef.name,
          theme.templateRef.version,
        );
        if (!template) {
          throw new Error(
            `Template not found: ${theme.templateRef.name} v${theme.templateRef.version}`,
          );
        }

        const { dark, light } = await generateThemePairAsync(theme, template);
        const outputs = [
          { generatedTheme: dark, fileName: toSafeFileName(theme.name, false) },
          { generatedTheme: light, fileName: toSafeFileName(theme.name, true) },
        ];
        const themeOutputPaths: string[] = [];
        for (const output of outputs) {
          if (!this.validateIsThemeFileNameValid.test(output.fileName)) {
            throw new Error(`Invalid theme output filename: ${output.fileName}`);
          }
          const outputPath = `${EXTENSION_THEMES_EXPORT_PREFIX}/${output.fileName}`;
          await this.fileSystemService.saveFile(
            outputPath,
            await stringifyThemeAsync(output.generatedTheme),
          );
          themeOutputPaths.push(outputPath);
        }
        outputPaths.push(...themeOutputPaths);
        generatedCount += 1;
      } catch (error) {
        failures.push({
          themeName: reference.name,
          version: reference.version,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const message = failures.length === 0
      ? `Generated ${generatedCount} dark/light theme pairs.`
      : `Generated ${generatedCount} theme pairs; ${failures.length} failed.`;
    const result = {
      success: failures.length === 0,
      generatedCount,
      outputPaths,
      failures,
      message,
    };
    return result;
  }
}
