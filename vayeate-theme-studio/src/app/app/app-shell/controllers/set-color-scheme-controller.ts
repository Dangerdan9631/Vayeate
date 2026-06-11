import { singleton } from 'tsyringe';
import { SaveAppConfigOperation } from '../../../../domain/operations/app-operations/save-app-config-operation';
import { SetColorSchemeOperation } from '../../../../domain/operations/app-operations/set-color-scheme-operation';

/**
 * Sets an explicit light or dark color scheme and persists app config.
 */
@singleton()
export class SetColorSchemeController {
  constructor(
    private readonly setColorScheme: SetColorSchemeOperation,
    private readonly saveAppConfig: SaveAppConfigOperation,
  ) {}

  /**
   * Applies the requested color scheme and saves app config.
   * @param scheme Target scheme; must be `'light'` or `'dark'`.
   */
  run(scheme: 'light' | 'dark'): void {
    this.setColorScheme.execute(scheme);
    this.saveAppConfig.execute();
  }
}
