import type { Source } from '../../../model/schema/catalog';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../domain/catalog/state/catalogs-store';
import { AddSourceToCatalogOperation } from '../../../domain/operations/catalog-operations/sources/add-source-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../domain/catalog/state/catalogs-store';

@singleton()
export class AddNewSourceController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addSourceToCatalog: AddSourceToCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(): void {
    const store = this.catalogsStore.getStore();
    const state = store.stateV2;
    const catalog = getCurrentCatalog(store);
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
    store.clearNewSourceData();
  }
}
