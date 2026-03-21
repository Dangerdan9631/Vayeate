import type { Catalog } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SaveCatalog } from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class SaveCatalogController {
  constructor(
    private readonly saveCatalog: SaveCatalog,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(catalog: Catalog): Promise<void> {
    await this.saveCatalog.execute(catalog);
    await this.catalogSharedFlows.refreshRefsAndSelect(catalog.name, catalog.version);
  }
}
