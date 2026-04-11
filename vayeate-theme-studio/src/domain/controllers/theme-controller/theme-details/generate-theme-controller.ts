import { singleton } from 'tsyringe';
import { GenerateThemeOperation } from '../../../operations/theme-operations';

@singleton()
export class GenerateThemeController {
  constructor(private readonly generateTheme: GenerateThemeOperation) {}

  async run(): Promise<void> {
    await this.generateTheme.execute();
  }
}
