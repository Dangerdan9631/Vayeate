import { singleton } from 'tsyringe';
import { parseInitialAppConfig } from '../../model/parse-initial-app-config';
import { AppConfigStore } from '../../domain/state/app-config/app-config-store';

@singleton()
export class AppConfigBootstrapService {
  constructor(private readonly appConfigStore: AppConfigStore) {}
  getInitialAppConfig(): void {
    const snapshot = window.electronAPI?.getInitialAppConfig?.();
    const parsed = parseInitialAppConfig(snapshot);
    this.appConfigStore.getStore().setConfig({ ...this.appConfigStore.getStore().config, ...parsed });
  }
}
