import { singleton } from 'tsyringe';
import { appConfigSchema } from '../../../model/schema/primitives';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { BackgroundQueueGateway } from '../../../gateway/background-queue-gateway';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class SaveAppConfigOperation {
  constructor(
    private readonly appConfigStore: AppConfigStore,
    private readonly configGateway: ConfigGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    const appConfigState = this.appConfigStore.getStore().config;
    this.backgroundQueueGateway.enqueue(async () => {
        this.configGateway.save(
          appConfigSchema.parse(appConfigState),
        );
    }, 'Saving app config');
  }
}
