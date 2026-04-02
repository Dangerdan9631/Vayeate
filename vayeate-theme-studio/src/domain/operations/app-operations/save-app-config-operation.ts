import { singleton } from 'tsyringe';
import { appConfigSchema } from '../../../model/schemas';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { AppConfigStateGetter } from '../../state/app-config/app-config-state-reducer';

@singleton()
export class SaveAppConfigOperation {
  constructor(
    private readonly appConfigStateGetter: AppConfigStateGetter,
    private readonly configGateway: ConfigGateway,
  ) {}

  async execute(): Promise<void> {
    const appConfigState = this.appConfigStateGetter.current();
    await this.configGateway.save(
      appConfigSchema.parse({ colorScheme: appConfigState.colorScheme }),
    );
  }
}
