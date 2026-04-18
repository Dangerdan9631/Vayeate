import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { EnqueueBackgroundActionOperation } from './enqueue-background-action-operation';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class LoadAppConfigOperation {
  constructor(
    private readonly configGateway: ConfigGateway,
    private readonly backgroundQueueGateway: EnqueueBackgroundActionOperation,
    private readonly appConfigStore: AppConfigStore,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.execute(
      async () => {
        const config = await this.configGateway.load();
      this.appConfigStore.getStore().setConfig(config);
    }, 'Loading app config');
  }
}
