import { singleton } from 'tsyringe';
import { SaveAppConfigOperation } from '../../operations/app-operations/save-app-config-operation';
import { SetColorSchemeOperation } from '../../operations/app-operations/set-color-scheme-operation';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class ToggleColorSchemeController {
  constructor(
    private readonly appConfigStore: AppConfigStore,
    private readonly setColorScheme: SetColorSchemeOperation,
    private readonly saveAppConfig: SaveAppConfigOperation,
  ) {}

  async run(): Promise<void> {
    const current = this.appConfigStore.getState().config.colorScheme;
    const next = current === 'light' ? 'dark' : 'light';
    this.setColorScheme.execute(next);
    this.saveAppConfig.execute();
  }
}
