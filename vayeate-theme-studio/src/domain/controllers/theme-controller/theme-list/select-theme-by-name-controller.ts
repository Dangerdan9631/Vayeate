import { singleton } from 'tsyringe';
import { GetThemeRefsOperation } from '../../../operations/theme-operations';
import { SelectThemeAndLoadOperation } from '../../../operations/theme-operations/theme-list/select-theme-and-load-operation';
import { findBestVersionRef } from '../../../utils/version';

@singleton()
export class SelectThemeByNameController {
  constructor(
    private readonly getThemeRefs: GetThemeRefsOperation,
    private readonly selectThemeAndLoad: SelectThemeAndLoadOperation,
  ) {}

  async run(name: string): Promise<void> {
    const best = findBestVersionRef(this.getThemeRefs.execute(), name);
    if (!best) return;
    await this.selectThemeAndLoad.execute(best.name, best.version);
  }
}
