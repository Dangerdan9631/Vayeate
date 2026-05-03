import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import { AppConfigStore } from '../../state/data/app-config-store';
import { ContinuationHandler } from '../../../app/core/background-queue/background-queue';

@singleton()
export class LoadAppConfigOperation {
  constructor(
    private readonly configGateway: ConfigGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
    private readonly appConfigStore: AppConfigStore,
  ) {}

  execute(): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      'Loading app config',
      async () => {
        const config = await this.configGateway.load();
        this.appConfigStore.getStore().setConfig(config);
      }
    );
  }
}
