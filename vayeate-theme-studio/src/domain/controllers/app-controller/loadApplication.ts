import { singleton } from 'tsyringe';
import { LoadAppConfig } from '../../operations/app-operations';
import { ClearPersistedUndo } from '../../operations/undo-operations';
import { LoadCatalogRefs } from '../../operations/catalog-operations';
import { LoadTemplateRefs } from '../../operations/template-operations';
import { LoadThemeRefs } from '../../operations/theme-operations';

@singleton()
export class LoadApplicationController {
  constructor(
    private readonly clearPersistedUndo: ClearPersistedUndo,
    private readonly loadAppConfig: LoadAppConfig,
    private readonly loadCatalogRefs: LoadCatalogRefs,
    private readonly loadTemplateRefs: LoadTemplateRefs,
    private readonly loadThemeRefs: LoadThemeRefs,
  ) {}

  async run(): Promise<void> {
    await this.clearPersistedUndo.execute();
    await this.loadAppConfig.execute();
    await this.loadCatalogRefs.execute();
    await this.loadTemplateRefs.execute();
    await this.loadThemeRefs.execute();
  }
}
