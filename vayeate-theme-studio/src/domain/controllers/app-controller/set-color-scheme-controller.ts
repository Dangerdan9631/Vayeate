import { singleton } from 'tsyringe';
import { SaveAppConfigOperation, SetColorSchemeOperation } from '../../operations/app-operations';

@singleton()
export class SetColorSchemeController {
  constructor(
    private readonly setColorScheme: SetColorSchemeOperation,
    private readonly saveAppConfig: SaveAppConfigOperation,
  ) {}

  async run(scheme: 'light' | 'dark'): Promise<void> {
    this.setColorScheme.execute(scheme);
    await this.saveAppConfig.execute();
  }
}
