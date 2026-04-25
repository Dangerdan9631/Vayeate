import { singleton } from 'tsyringe';
import { appConfigSchema } from '../../../model/schema/primitives';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class SaveAppConfigOperation {
  constructor(
    private readonly appConfigStore: AppConfigStore,
    private readonly configGateway: ConfigGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): void {
    const appConfigState = this.appConfigStore.getStore().config;
    this.enqueueBackgroundAction.execute(
      'Saving app config',
      async () => {
        this.configGateway.save(
          appConfigSchema.parse(appConfigState),
        );
      }
    );
  }
}
