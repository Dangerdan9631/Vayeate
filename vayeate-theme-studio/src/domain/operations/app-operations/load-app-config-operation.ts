import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { BackgroundQueueGateway } from '../../../gateway/background-queue-gateway';
import { AppConfigStore } from '../../state/app-config/app-config-store';

@singleton()
export class LoadAppConfigOperation {
  constructor(
    private readonly configGateway: ConfigGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
    private readonly appConfigStore: AppConfigStore,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(
      async () => {
        const config = await this.configGateway.load();
      this.appConfigStore.getState().setConfig(config);
    }, 'Loading app config');
  }
}
