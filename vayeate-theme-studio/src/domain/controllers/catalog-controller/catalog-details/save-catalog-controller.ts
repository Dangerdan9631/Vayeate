import type { Catalog } from '../../../../model/schema/catalog';
import { singleton } from 'tsyringe';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

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
