import type { Catalog } from '../../../model/schema/catalog';
import { singleton } from 'tsyringe';
import { SaveCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class SaveCatalogController {
  constructor(
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(catalog: Catalog): void {
    this.saveCatalog.execute(catalog);
    this.refreshCatalogRefsAndSelect.execute(catalog.name, catalog.version);
  }
}
