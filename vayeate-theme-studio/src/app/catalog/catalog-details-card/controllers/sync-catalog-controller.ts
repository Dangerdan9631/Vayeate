import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/data/catalogs-store';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { SyncCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/sync-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { ValidateSyncCatalog } from '../../../../domain/catalog/validations/validate-sync-catalog';
import { getCurrentCatalog } from '../../../../domain/state/data/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

@singleton()
export class SyncCatalogController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly validateSyncCatalog: ValidateSyncCatalog,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly syncCatalog: SyncCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.stateV2.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!this.validateSyncCatalog.test(catalog)) return;

    const synced = await this.syncCatalog.execute(catalog);
    this.saveCatalog.execute(synced);
    this.refreshCatalogRefsAndSelect.execute(synced.name, synced.version);
  }
}
