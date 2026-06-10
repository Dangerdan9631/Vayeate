import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';
import { CatalogsStore } from '../../catalog/state/catalogs-store';
import { CatalogUiStore } from '../../state/ui/catalog-ui-store';
import { SaveCatalogOperation } from '../catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../delete/refresh-catalog-refs-and-select-operation';

/** Applies a catalog snapshot through the standard persist and selection path (undo/redo). */
@singleton()
export class ApplyCatalogUndoStateOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  execute(catalog: Catalog): void {
    this.catalogsStore.getStore().upsertCatalogs([catalog]);
    this.catalogUiStore.getStore().selectCatalog({ name: catalog.name, version: catalog.version });
    this.saveCatalog.execute(catalog);
    this.refreshCatalogRefsAndSelect.execute(catalog.name, catalog.version);
  }
}
