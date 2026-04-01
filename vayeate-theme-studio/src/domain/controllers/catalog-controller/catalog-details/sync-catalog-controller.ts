import type { Catalog } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SaveCatalogOperation, SyncCatalogOperation } from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class SyncCatalogController {
  constructor(
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly syncCatalog: SyncCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(catalog: Catalog): Promise<void> {
    const synced = await this.syncCatalog.execute(catalog);
    await this.saveCatalog.execute(synced);
    await this.catalogSharedFlows.refreshRefsAndSelect(synced.name, synced.version);
  }
}
