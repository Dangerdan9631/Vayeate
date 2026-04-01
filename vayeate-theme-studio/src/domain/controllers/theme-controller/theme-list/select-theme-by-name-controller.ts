import { singleton } from 'tsyringe';
import { GetThemeRefsOperation } from '../../../operations/theme-operations';
import { findBestVersionRef } from '../../../utils/version';
import { SelectThemeAndLoadController } from './select-theme-and-load-controller';

@singleton()
export class SelectThemeByNameController {
  constructor(
    private readonly getThemeRefs: GetThemeRefsOperation,
    private readonly selectThemeAndLoad: SelectThemeAndLoadController,
  ) {}

  async run(name: string): Promise<void> {
    const best = findBestVersionRef(this.getThemeRefs.execute(), name);
    if (!best) return;
    await this.selectThemeAndLoad.run(best.name, best.version);
  }
}
