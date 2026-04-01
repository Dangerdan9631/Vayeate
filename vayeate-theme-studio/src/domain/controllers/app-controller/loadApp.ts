import { singleton } from 'tsyringe';
import {
  InitializeWindowService,
  LoadAppConfig,
} from '../../operations/app-operations';
import { LoadCatalogRefs } from '../../operations/catalog-operations';
import { LoadTemplateRefs } from '../../operations/template-operations';
import { LoadThemeRefs } from '../../operations/theme-operations';
import { ClearPersistedUndo } from '../../operations/undo-operations';

@singleton()
export class LoadAppController {
  constructor(
    private readonly clearPersistedUndo: ClearPersistedUndo,
    private readonly loadAppConfig: LoadAppConfig,
    private readonly loadCatalogRefs: LoadCatalogRefs,
    private readonly loadTemplateRefs: LoadTemplateRefs,
    private readonly loadThemeRefs: LoadThemeRefs,
    private readonly initializeWindowService: InitializeWindowService,
  ) { }
  
  run(): void {
    void this.clearPersistedUndo.execute();
    void this.loadAppConfig.execute();
    void this.loadCatalogRefs.execute();
    void this.loadTemplateRefs.execute();
    void this.loadThemeRefs.execute();
    this.initializeWindowService.execute();
  }
}
