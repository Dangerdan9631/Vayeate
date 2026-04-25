import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class LoadAppConfigOperation {
  constructor(
    private readonly configGateway: ConfigGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
    private readonly appConfigStore: AppConfigStore,
  ) {}

  execute(): void {
    this.enqueueBackgroundAction.execute(
      'Loading app config',
      async () => { 
        const config = await this.configGateway.load();
        this.appConfigStore.getStore().setConfig(config);
      }
    );
  }
}
