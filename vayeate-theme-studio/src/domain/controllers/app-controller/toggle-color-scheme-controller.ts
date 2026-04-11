import { singleton } from 'tsyringe';
import { SaveAppConfigOperation, SetColorSchemeOperation } from '../../operations/app-operations';
import { AppConfigStateGetter } from '../../state/app-config/app-config-state-reducer';

@singleton()
export class ToggleColorSchemeController {
  constructor(
    private readonly appConfigStateGetter: AppConfigStateGetter,
    private readonly setColorScheme: SetColorSchemeOperation,
    private readonly saveAppConfig: SaveAppConfigOperation,
  ) {}

  async run(): Promise<void> {
    const current = this.appConfigStateGetter.current().colorScheme;
    const next = current === 'light' ? 'dark' : 'light';
    this.setColorScheme.execute(next);
    await this.saveAppConfig.execute();
  }
}
