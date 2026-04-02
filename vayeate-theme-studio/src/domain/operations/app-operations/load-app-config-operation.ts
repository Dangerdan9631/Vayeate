import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { AppConfigStateSetter } from '../../state/app-config/app-config-state-reducer';

@singleton()
export class LoadAppConfigOperation {
  constructor(
    private readonly configGateway: ConfigGateway,
    private readonly appConfigStateSetter: AppConfigStateSetter,
  ) {}

  async execute(): Promise<void> {
    const config = await this.configGateway.load();
    this.appConfigStateSetter.apply({
      type: 'SET_APP_CONFIG_STATE',
      config: { colorScheme: config.colorScheme },
    });
  }
}
