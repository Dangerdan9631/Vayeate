import { singleton } from 'tsyringe';
import { InitializeWindowServiceOperation } from '../../operations/app-operations/initialize-window-service-operation';
import { LoadAppConfigOperation } from '../../operations/app-operations/load-app-config-operation';
import { LoadCatalogRefsOperation } from '../../operations/catalog-operations/catalog-list/load-catalog-refs-operation';
import { LoadTemplateRefsOperation } from '../../operations/template-operations/template-list/load-template-refs-operation';
import { LoadThemeRefsOperation } from '../../operations/theme-operations/theme-list/load-theme-refs-operation';
import { ClearPersistedUndoOperation } from '../../operations/undo-operations/clear-persisted-undo-operation';

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
