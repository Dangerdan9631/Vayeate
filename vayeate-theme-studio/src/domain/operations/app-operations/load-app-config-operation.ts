import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { AppConfigStateSetter } from '../../state/app-config/app-config-state-reducer';
import { BackgroundQueueGateway } from '../../../gateway/background-queue-gateway';

@singleton()
export class LoadAppConfigOperation {
  constructor(
    private readonly configGateway: ConfigGateway,
    private readonly appConfigStateSetter: AppConfigStateSetter,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => {
      const config = await this.configGateway.load();
      this.appConfigStateSetter.apply({
        type: 'SET_APP_CONFIG_STATE',
        config: { colorScheme: config.colorScheme },
      });
    });
  }
}
