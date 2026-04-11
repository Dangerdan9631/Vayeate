import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { SyncCatalogOperation } from '../../../operations/catalog-operations/catalog-details/sync-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { ValidateSyncCatalog } from '../../../validations/catalog-validations';

@singleton()
export class SyncCatalogController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly validateSyncCatalog: ValidateSyncCatalog,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly syncCatalog: SyncCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!this.validateSyncCatalog.test(catalog)) return;

    const synced = await this.syncCatalog.execute(catalog);
    await this.saveCatalog.execute(synced);
    await this.refreshCatalogRefsAndSelect.execute(synced.name, synced.version);
  }
}
