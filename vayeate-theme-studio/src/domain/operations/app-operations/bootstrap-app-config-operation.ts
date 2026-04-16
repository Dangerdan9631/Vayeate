import { singleton } from 'tsyringe';
import { AppConfigBootstrapService } from '../../../gateway/services/app-config-bootstrap-service';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class BootstrapAppConfigOperation {
  constructor(
    private readonly appConfigBootstrapService: AppConfigBootstrapService,
    private readonly appConfigStore: AppConfigStore,
  ) {}

  execute(): void {
    const initialConfig = this.appConfigBootstrapService.getInitialAppConfig();
    this.appConfigStore.getStore().setConfig({
      ...this.appConfigStore.getStore().config,
      ...initialConfig,
    });
  }
}
