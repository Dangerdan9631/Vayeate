import { singleton } from 'tsyringe';
import { ConfigGateway } from '../../../gateway/config/config-gateway';

@singleton()
export class SaveColorScheme {
  constructor(private readonly configGateway: ConfigGateway) {}

  async execute(scheme: 'light' | 'dark'): Promise<void> {
    await this.configGateway.save({ colorScheme: scheme });
  }
}
