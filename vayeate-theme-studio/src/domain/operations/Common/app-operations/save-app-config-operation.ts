import { singleton } from 'tsyringe';
import { appConfigSchema } from '../../../../model/Common/schema/primitives';
import { APP_CONFIG_DATA_FILE_KEY } from '../../../../model/Common/data-path-keys';
import { ConfigGateway } from '../../../../gateway/gateway/Common/config/config-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../Queue/background-queue/enqueue-background-queue-action-operation';
import { AppConfigStore } from '../../../state/Common/data/app-config-store';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/Queue/background-queue';

/**
 * Persists app config from the store through background I/O.
 */

@singleton()
export class SaveAppConfigOperation {
  constructor(
    private readonly appConfigStore: AppConfigStore,
    private readonly configGateway: ConfigGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the save app config mutation.
   * @returns Background-queue continuation for chained async work.
   */

  execute(): ContinuationHandler {
    const appConfigState = this.appConfigStore.getStore().config;
    return this.enqueueBackgroundAction.execute(
      'data_io',
      'Saving app config',
      async () => {
        this.configGateway.save(
          appConfigSchema.parse(appConfigState),
        );
      },
      { key: APP_CONFIG_DATA_FILE_KEY, access: 'write' },
    );
  }
}
