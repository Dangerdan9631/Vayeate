import type { Catalog } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SaveCatalog, SyncCatalog } from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class SyncCatalogController {
  constructor(
    private readonly saveCatalog: SaveCatalog,
    private readonly syncCatalog: SyncCatalog,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(catalog: Catalog): Promise<void> {
    const synced = await this.syncCatalog.execute(catalog);
    await this.saveCatalog.execute(synced);
    await this.catalogSharedFlows.refreshRefsAndSelect(synced.name, synced.version);
  }
}
