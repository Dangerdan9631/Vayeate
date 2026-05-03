import { singleton } from 'tsyringe';
import { appConfigSchema } from '../../../model/schema/primitives';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import { AppConfigStore } from '../../state/data/app-config-store';
import { ContinuationHandler } from '../../../app/core/background-queue/background-queue';

@singleton()
export class SaveAppConfigOperation {
  constructor(
    private readonly appConfigStore: AppConfigStore,
    private readonly configGateway: ConfigGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): ContinuationHandler {
    const appConfigState = this.appConfigStore.getStore().config;
    return this.enqueueBackgroundAction.execute(
      'worker',
      'Saving app config',
      async () => {
        this.configGateway.save(
          appConfigSchema.parse(appConfigState),
        );
      }
    );
  }
}
