import { singleton } from 'tsyringe';
import { GenerateThemeOperation } from '../../../../../domain/operations/theme-operations/theme-details/generate-theme-operation';

@singleton()
export class GenerateThemeController {
  constructor(private readonly generateTheme: GenerateThemeOperation) {}

  run(): void {
    this.generateTheme.execute();
  }
}
