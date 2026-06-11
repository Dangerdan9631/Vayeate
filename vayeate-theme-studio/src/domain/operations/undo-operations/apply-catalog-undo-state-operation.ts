import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';
import { CatalogsStore, getCurrentCatalog } from '../../catalog/state/catalogs-store';
import { CatalogUiStore } from '../../state/ui/catalog-ui-store';
import { entityRefsChanged } from '../../utils/entity-refs-changed';
import { SaveCatalogOperation } from '../catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../delete/refresh-catalog-refs-and-select-operation';

/**
 * Applies a catalog snapshot through the standard persist and selection path (undo/redo).
 */
@singleton()
export class ApplyCatalogUndoStateOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  /**
   * Runs the apply catalog undo state mutation.
   * @param catalog Catalog (Catalog).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(catalog: Catalog): void {
    const store = this.catalogsStore.getStore();
    const selectedRef = this.catalogUiStore.getStore().state.selectedRef;
    const prior = selectedRef ? getCurrentCatalog(store.state.catalogs, selectedRef) : null;
    const refsChanged = prior !== null && entityRefsChanged(prior, catalog);

    this.catalogsStore.getStore().upsertCatalogs([catalog]);
    this.catalogUiStore.getStore().selectCatalog({ name: catalog.name, version: catalog.version });
    this.saveCatalog.execute(catalog);
    this.refreshCatalogRefsAndSelect.execute(catalog.name, catalog.version, catalog, refsChanged);
  }
}
