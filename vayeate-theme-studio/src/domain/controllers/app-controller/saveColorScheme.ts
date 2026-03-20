import { singleton } from 'tsyringe';
import { SaveColorScheme } from '../../operations/app-operations';

@singleton()
export class SaveColorSchemeController {
  constructor(private readonly saveColorScheme: SaveColorScheme) {}

  async run(scheme: 'light' | 'dark'): Promise<void> {
    await this.saveColorScheme.execute(scheme);
  }
}
