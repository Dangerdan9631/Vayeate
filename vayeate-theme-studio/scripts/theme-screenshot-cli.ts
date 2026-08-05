import 'reflect-metadata';
import { app } from 'electron';
import { TemplateGateway } from '../src/gateway/gateway/Template/template/template-gateway';
import { ThemeGateway } from '../src/gateway/gateway/Theme/theme/theme-gateway';
import { ThemeScreenshotService } from '../src/gateway/services/Common/theme-screenshot-service';
import { GenerateThemeScreenshotsOperation } from '../src/domain/operations/Theme/theme-operations/theme-details/generate-theme-screenshots-operation';
import { ValidateIsThemeFileNameValid } from '../src/domain/validations/Theme/theme-validations/validate-is-theme-file-name-valid';
import type {
  ThemeScreenshotRequest,
  ThemeScreenshotResult,
} from '../src/model/Theme/theme-build';
import { generateThemeScreenshots } from '../electron/theme-screenshot';
import { NodeFileSystemService } from './node-file-system-service';

class CliThemeScreenshotService extends ThemeScreenshotService {
  override async generateAll(
    requests: readonly ThemeScreenshotRequest[],
  ): Promise<ThemeScreenshotResult[]> {
    return generateThemeScreenshots(requests);
  }
}

void app.whenReady().then(async () => {
  try {
    const fileSystemService = new NodeFileSystemService();
    const operation = new GenerateThemeScreenshotsOperation(
      new ThemeGateway(fileSystemService),
      new TemplateGateway(fileSystemService),
      new CliThemeScreenshotService(),
      new ValidateIsThemeFileNameValid(),
    );
    const result = await operation.execute();
    console.log(result.message);
    for (const failure of result.failures) {
      console.error(`${failure.themeName} ${failure.version}: ${failure.message}`.trim());
    }
    if (!result.success) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    app.quit();
  }
});
