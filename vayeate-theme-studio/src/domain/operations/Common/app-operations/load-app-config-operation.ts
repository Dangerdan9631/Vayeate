import { singleton } from 'tsyringe';
import { APP_CONFIG_DATA_FILE_KEY } from '../../../../model/Common/data-path-keys';
import { ConfigGateway } from '../../../../gateway/gateway/Common/config/config-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import { AppConfigStore } from '../../../state/Common/data/app-config-store';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/Common/background-queue';

/**
 * Loads app config from persistence into the store.
 */

@singleton()
export class LoadAppConfigOperation {
  constructor(
    private readonly configGateway: ConfigGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
    private readonly appConfigStore: AppConfigStore,
  ) {}

  /**
   * Runs the load app config mutation.
   * @returns Background-queue continuation for chained async work.
   */

  execute(): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'data_io',
      'Loading app config',
      async () => {
        const config = await this.configGateway.load();
        this.appConfigStore.getStore().setConfig(config);
      },
      { key: APP_CONFIG_DATA_FILE_KEY, access: 'read' },
    );
  }
}
