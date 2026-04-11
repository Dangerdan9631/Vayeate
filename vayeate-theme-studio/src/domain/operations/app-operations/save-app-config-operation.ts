import { singleton } from 'tsyringe';
import { appConfigSchema } from '../../../model/schemas';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { BackgroundQueueGateway } from '../../../gateway/background-queue-gateway';
import { AppConfigStateGetter } from '../../state/app-config/app-config-state-reducer';

@singleton()
export class SaveAppConfigOperation {
  constructor(
    private readonly appConfigStateGetter: AppConfigStateGetter,
    private readonly configGateway: ConfigGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    const appConfigState = this.appConfigStateGetter.current();
    this.backgroundQueueGateway.enqueue(async () =>
      this.configGateway.save(
        appConfigSchema.parse({ colorScheme: appConfigState.colorScheme }),
      ),
    );
  }
}
