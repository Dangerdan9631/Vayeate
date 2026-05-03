import type { Source } from '../../../../model/schema/catalog';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/data/catalogs-store';
import { AddSourceToCatalogOperation } from '../../../../domain/operations/catalog-operations/sources/add-source-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/data/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { ClearCatalogNewSourceDataOperation } from '../../../../domain/operations/catalog-operations/sources/clear-catalog-new-source-data-operation';

@singleton()
export class AddNewSourceController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addSourceToCatalog: AddSourceToCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly clearCatalogNewSourceData: ClearCatalogNewSourceDataOperation,
  ) {}

  run(): void {
    const store = this.catalogsStore.getStore();
    const uiStore = this.catalogUiStore.getStore();
    const state = uiStore.state;
    const catalog = getCurrentCatalog(store.stateV2.catalogs, state.selectedRef);
    const url = state.newSource.url?.trim();
    if (!catalog || !url) return;
    const source: Source = {
      url,
      type: state.newSource.type,
      tokenType: state.newSource.tokenType,
    };
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.addSourceToCatalog.execute(base, source);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
    this.clearCatalogNewSourceData.execute();
  }
}
