import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';
import { AppStateGetter } from '../../state/app-state-getter';

@singleton()
export class SaveAppConfigOperation {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly configGateway: ConfigGateway,
  ) {}

  async execute(): Promise<void> {
    const { appConfig } = this.appStateGetter.current();
    await this.configGateway.save(appConfig);
  }
}
