import { singleton } from 'tsyringe';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class SetColorSchemeOperation {
  constructor(private readonly appConfigStore: AppConfigStore) {}

  execute(scheme: 'light' | 'dark'): void {
    this.appConfigStore.getState().setColorScheme(scheme);
  }
}
