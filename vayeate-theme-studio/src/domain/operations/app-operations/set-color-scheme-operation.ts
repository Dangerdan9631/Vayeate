import { singleton } from 'tsyringe';
import { AppConfigStore } from '../../state/data/app-config-store';

@singleton()
export class SetColorSchemeOperation {
  constructor(private readonly appConfigStore: AppConfigStore) {}

  execute(scheme: 'light' | 'dark'): void {
    this.appConfigStore.getStore().setColorScheme(scheme);
  }
}
