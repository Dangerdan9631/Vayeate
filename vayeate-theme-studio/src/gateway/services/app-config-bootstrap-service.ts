import { singleton } from 'tsyringe';
import { initialAppState } from '../../domain/state/app-state';
import type { AppConfig } from '../../model/schemas';

@singleton()
export class AppConfigBootstrapService {
  getInitialAppConfig(): AppConfig {
    const snapshot = window.electronAPI?.getInitialAppConfig?.();
    const appConfig = snapshot ?? {};
    return { ...initialAppState.appConfig, ...appConfig };
  }
}
