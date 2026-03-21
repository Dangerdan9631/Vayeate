import { singleton } from 'tsyringe';
import { ConfigService } from '../../../gateway/services/config-service';

@singleton()
export class SaveColorScheme {
  constructor(private readonly configService: ConfigService) {}

  async execute(scheme: 'light' | 'dark'): Promise<void> {
    await this.configService.save({ colorScheme: scheme });
  }
}
