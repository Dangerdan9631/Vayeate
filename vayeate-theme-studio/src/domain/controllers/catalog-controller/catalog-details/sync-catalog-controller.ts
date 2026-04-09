import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { SaveCatalogOperation, SyncCatalogOperation } from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class SyncCatalogController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly syncCatalog: SyncCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!catalog || catalog.type !== 'remote') return;

    const synced = await this.syncCatalog.execute(catalog);
    await this.saveCatalog.execute(synced);
    await this.catalogSharedFlows.refreshRefsAndSelect(synced.name, synced.version);
  }
}
