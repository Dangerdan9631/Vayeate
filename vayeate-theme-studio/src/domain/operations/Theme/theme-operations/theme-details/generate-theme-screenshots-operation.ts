import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../../gateway/gateway/Template/template/template-gateway';
import { ThemeGateway } from '../../../../../gateway/gateway/Theme/theme/theme-gateway';
import { ThemeScreenshotService } from '../../../../../gateway/services/Common/theme-screenshot-service';
import type {
  ThemeBatchBuildResult,
  ThemeBuildFailure,
  ThemeScreenshotRequest,
  ThemeScreenshotResult,
} from '../../../../../model/Theme/theme-build';
import { ValidateIsThemeFileNameValid } from '../../../../validations/Theme/theme-validations/validate-is-theme-file-name-valid';
import { generateThemePairAsync } from '../theme-utils/theme-generator-operation';
import { toSafeFileName } from '../theme-utils/to-safe-theme-file-name-operation';
import { latestThemeReferences } from './latest-theme-references-operation';

/**
 * Generates VS Code-style screenshots for both variants of every latest theme file.
 */
@singleton()
export class GenerateThemeScreenshotsOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly templateGateway: TemplateGateway,
    private readonly themeScreenshotService: ThemeScreenshotService,
    private readonly validateIsThemeFileNameValid: ValidateIsThemeFileNameValid,
  ) {}

  /**
   * Builds screenshot payloads from current source data and captures them in VS Code.
   *
   * @returns Batch result including captured paths and per-theme failures.
   */
  async execute(): Promise<ThemeBatchBuildResult> {
    const requests: ThemeScreenshotRequest[] = [];
    const failures: ThemeBuildFailure[] = [];
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
        const darkThemeFileName = toSafeFileName(theme.name, false);
        const lightThemeFileName = toSafeFileName(theme.name, true);
        if (!this.validateIsThemeFileNameValid.test(darkThemeFileName)
          || !this.validateIsThemeFileNameValid.test(lightThemeFileName)) {
          throw new Error(`Invalid screenshot filename for ${theme.name}`);
        }
        const slug = darkThemeFileName.replace(/-color-theme\.json$/, '');
        requests.push(
          { theme: dark, outputPath: `images/${slug}-theme.png` },
          { theme: light, outputPath: `images/${slug}-light-theme.png` },
        );
      } catch (error) {
        failures.push({
          themeName: reference.name,
          version: reference.version,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    let screenshotResults: ThemeScreenshotResult[] = [];
    try {
      screenshotResults = requests.length > 0
        ? await this.themeScreenshotService.generateAll(requests)
        : [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      for (const request of requests) {
        failures.push({
          themeName: request.outputPath,
          version: '',
          message,
        });
      }
    }
    const outputPaths = screenshotResults
      .filter((result) => result.success)
      .map((result) => result.outputPath);
    for (const result of screenshotResults) {
      if (!result.success) {
        failures.push({
          themeName: result.outputPath,
          version: '',
          message: result.error ?? 'Screenshot capture failed',
        });
      }
    }

    const generatedCount = outputPaths.length;
    const message = failures.length === 0
      ? `Generated ${generatedCount} theme screenshots.`
      : `Generated ${generatedCount} screenshots; ${failures.length} failed.`;
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
