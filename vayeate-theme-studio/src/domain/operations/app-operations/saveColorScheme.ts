import { singleton } from 'tsyringe';
import { configService } from '../../../gateway/services/config-service';

@singleton()
export class SaveColorScheme {
  async execute(scheme: 'light' | 'dark'): Promise<void> {
    await configService.save({ colorScheme: scheme });
  }
}
