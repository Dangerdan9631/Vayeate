import { singleton } from 'tsyringe';
import { initialAppState } from '../../domain/state/app-state';
import { parseInitialAppConfig } from '../../model/parse-initial-app-config';
import type { AppConfig } from '../../model/schemas';

@singleton()
export class AppConfigBootstrapService {
  getInitialAppConfig(): AppConfig {
    const snapshot = window.electronAPI?.getInitialAppConfig?.();
    const parsed = parseInitialAppConfig(snapshot);
    return { ...initialAppState.appConfig, ...parsed };
  }
}
