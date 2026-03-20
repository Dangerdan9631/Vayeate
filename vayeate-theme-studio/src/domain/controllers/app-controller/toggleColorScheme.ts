import { singleton } from 'tsyringe';
import { ToggleColorScheme } from '../../operations/app-operations';

@singleton()
export class ToggleColorSchemeController {
  constructor(private readonly toggleColorScheme: ToggleColorScheme) {}

  async run(checked: boolean): Promise<void> {
    await this.toggleColorScheme.execute(checked);
  }
}
