import { singleton } from 'tsyringe';
import { SaveAppConfigOperation } from '../../../../domain/operations/app-operations/save-app-config-operation';
import { SetColorSchemeOperation } from '../../../../domain/operations/app-operations/set-color-scheme-operation';

@singleton()
export class SetColorSchemeController {
  constructor(
    private readonly setColorScheme: SetColorSchemeOperation,
    private readonly saveAppConfig: SaveAppConfigOperation,
  ) {}

  run(scheme: 'light' | 'dark'): void {
    this.setColorScheme.execute(scheme);
    this.saveAppConfig.execute();
  }
}
