import type { Source } from '../../../../model/schema/catalog';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { AddSourceToCatalogOperation } from '../../../operations/catalog-operations/sources/add-source-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { SetCatalogNewSourceTokenTypeOperation } from '../../../operations/catalog-operations/sources/set-catalog-new-source-token-type-operation';
import { SetCatalogNewSourceTypeOperation } from '../../../operations/catalog-operations/sources/set-catalog-new-source-type-operation';
import { SetCatalogNewSourceUrlOperation } from '../../../operations/catalog-operations/sources/set-catalog-new-source-url-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class AddNewSourceController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrlOperation,
    private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenTypeOperation,
    private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addSourceToCatalog: AddSourceToCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(): void {
    const state = this.catalogsStore.getStore().state;
    const catalog = state.catalog;
    const url = state.newSourceUrl?.trim();
    if (!catalog || !url) return;
    const source: Source = {
      url,
      type: state.newSourceType,
      tokenType: state.newSourceTokenType,
    };
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.addSourceToCatalog.execute(base, source);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
    this.setCatalogNewSourceUrl.execute('');
    this.setCatalogNewSourceTokenType.execute('theme');
    this.setCatalogNewSourceType.execute('default');
  }
}
