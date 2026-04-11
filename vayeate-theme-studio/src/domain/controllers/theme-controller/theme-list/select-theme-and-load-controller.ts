import { singleton } from 'tsyringe';
import { SelectThemeAndLoadOperation } from '../../../operations/theme-operations/theme-list/select-theme-and-load-operation';

@singleton()
export class SelectThemeAndLoadController {
  constructor(private readonly selectThemeAndLoad: SelectThemeAndLoadOperation) {}

  async run(name: string, version: string): Promise<void> {
    await this.selectThemeAndLoad.execute(name, version);
  }
}
