import { singleton } from 'tsyringe';
import {
  InitializeWindowServiceOperation,
  LoadAppConfigOperation,
} from '../../operations/app-operations';
import { LoadCatalogRefsOperation } from '../../operations/catalog-operations';
import { LoadTemplateRefsOperation } from '../../operations/template-operations';
import { LoadThemeRefsOperation } from '../../operations/theme-operations';
import { ClearPersistedUndoOperation } from '../../operations/undo-operations';

@singleton()
export class LoadAppController {
  constructor(
    private readonly clearPersistedUndo: ClearPersistedUndoOperation,
    private readonly loadAppConfig: LoadAppConfigOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly loadTemplateRefs: LoadTemplateRefsOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly initializeWindowService: InitializeWindowServiceOperation,
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
