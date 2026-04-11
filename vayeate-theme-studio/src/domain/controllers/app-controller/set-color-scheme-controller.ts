import { singleton } from 'tsyringe';
import { SaveAppConfigOperation } from '../../operations/app-operations/save-app-config-operation';
import { SetColorSchemeOperation } from '../../operations/app-operations/set-color-scheme-operation';

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
