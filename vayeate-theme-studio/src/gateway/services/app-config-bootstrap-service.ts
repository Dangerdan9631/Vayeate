import { singleton } from 'tsyringe';
import { parseInitialAppConfig } from '../../model/parse-initial-app-config';
import type { AppConfig } from '../../model/schema/primitives';

@singleton()
export class AppConfigBootstrapService {
  getInitialAppConfig(): Partial<AppConfig> {
    const snapshot = window.electronAPI?.getInitialAppConfig?.();
    return parseInitialAppConfig(snapshot);
  }
}
