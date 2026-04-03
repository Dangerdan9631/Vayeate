import { singleton } from 'tsyringe';
import { initialAppState } from '../../domain/state/app-state';
import type { AppConfig } from '../../model/schemas';

@singleton()
export class AppConfigBootstrapService {
  getInitialAppConfig(): AppConfig {
    const appConfig = window.getElectronInitialAppConfig ?? {};
    return { ...initialAppState.appConfig, ...appConfig };
  }
}
