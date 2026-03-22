import { singleton } from 'tsyringe';
import { SaveAppConfig, SetColorScheme } from '../../operations/app-operations';

@singleton()
export class SetColorSchemeController {
  constructor(
    private readonly setColorScheme: SetColorScheme,
    private readonly saveAppConfig: SaveAppConfig,
  ) {}

  async run(scheme: 'light' | 'dark'): Promise<void> {
    this.setColorScheme.execute(scheme);
    await this.saveAppConfig.execute();
  }
}
