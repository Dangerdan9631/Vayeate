import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/catalog/catalogs-store';
import { LockCatalogOperation as LockCatalogTransform } from '../../../../domain/operations/catalog-operations/catalog-details/lock-catalog-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { ValidateCanLockCatalog } from '../../../../domain/catalog/validations/validate-can-lock-catalog';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/catalog/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

@singleton()
export class LockCatalogController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly lockCatalogTransform: LockCatalogTransform,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanLockCatalog: ValidateCanLockCatalog,
  ) {}

  run(): void {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.stateV2.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!catalog || !this.validateCanLockCatalog.test(catalog)) return;
    const updated = this.lockCatalogTransform.execute(catalog);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(catalog.name, catalog.version);
  }
}
