import { singleton } from 'tsyringe';
import { AppConfigStateGetter } from '../../state/app-config/app-config-state-reducer';
import { SetColorSchemeController } from './set-color-scheme-controller';

@singleton()
export class ToggleColorSchemeController {
  constructor(
    private readonly appConfigStateGetter: AppConfigStateGetter,
    private readonly setColorScheme: SetColorSchemeController,
  ) {}

  async run(): Promise<void> {
    const current = this.appConfigStateGetter.current().colorScheme;
    await this.setColorScheme.run(current === 'light' ? 'dark' : 'light');
  }
}
