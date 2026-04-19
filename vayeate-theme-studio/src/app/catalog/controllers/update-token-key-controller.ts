import type { TokenType } from '../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../domain/state/catalog/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { UpdateTokenKeyInCatalogOperation } from '../../../domain/operations/catalog-operations/tokens/update-token-key-in-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class UpdateTokenKeyController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateTokenKeyInCatalog: UpdateTokenKeyInCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(oldKey: string, newKey: string, tokenType: TokenType): void {
    const catalog = this.catalogsStore.getStore().state.catalog;
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateTokenKeyInCatalog.execute(base, oldKey, newKey, tokenType);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
