import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { AppStateSetter } from '../../state/app-state-setter';

@singleton()
export class LoadAppConfig {
  constructor(
    private readonly configGateway: ConfigGateway,
    private readonly appStateSetter: AppStateSetter,
  ) {}

  async execute(): Promise<void> {
    const config = await this.configGateway.load();
    this.appStateSetter.apply({ type: 'SET_APP_CONFIG', config });
  }
}
