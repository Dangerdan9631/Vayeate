import 'reflect-metadata';
import { TemplateGateway } from '../src/gateway/gateway/Template/template/template-gateway';
import { ThemeGateway } from '../src/gateway/gateway/Theme/theme/theme-gateway';
import { GenerateAllThemesOperation } from '../src/domain/operations/Theme/theme-operations/theme-details/generate-all-themes-operation';
import { ValidateIsThemeFileNameValid } from '../src/domain/validations/Theme/theme-validations/validate-is-theme-file-name-valid';
import { NodeFileSystemService } from './node-file-system-service';

const fileSystemService = new NodeFileSystemService();
const operation = new GenerateAllThemesOperation(
  new ThemeGateway(fileSystemService),
  new TemplateGateway(fileSystemService),
  fileSystemService,
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
