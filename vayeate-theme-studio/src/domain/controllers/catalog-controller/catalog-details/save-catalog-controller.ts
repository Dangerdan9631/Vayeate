import type { Catalog } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SaveCatalogOperation } from '../../../operations/catalog-operations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations';

@singleton()
export class SaveCatalogController {
  constructor(
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(catalog: Catalog): Promise<void> {
    await this.saveCatalog.execute(catalog);
    await this.refreshCatalogRefsAndSelect.execute(catalog.name, catalog.version);
  }
}
