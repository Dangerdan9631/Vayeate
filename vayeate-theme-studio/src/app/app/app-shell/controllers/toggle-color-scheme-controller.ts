import { singleton } from 'tsyringe';
import { SaveAppConfigOperation } from '../../../../domain/operations/app-operations/save-app-config-operation';
import { SetColorSchemeOperation } from '../../../../domain/operations/app-operations/set-color-scheme-operation';
import { AppConfigStore } from '../../../../domain/state/app-config/app-config-store';

@singleton()
export class ToggleColorSchemeController {
  constructor(
    private readonly appConfigStore: AppConfigStore,
    private readonly setColorScheme: SetColorSchemeOperation,
    private readonly saveAppConfig: SaveAppConfigOperation,
  ) {}

  run(): void {
    const current = this.appConfigStore.getStore().config.colorScheme;
    const next = current === 'light' ? 'dark' : 'light';
    this.setColorScheme.execute(next);
    this.saveAppConfig.execute();
  }
}
