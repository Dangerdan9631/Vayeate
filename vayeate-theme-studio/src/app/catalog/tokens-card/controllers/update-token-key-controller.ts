import type { TokenType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/data/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { UpdateTokenKeyInCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/update-token-key-in-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/data/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

@singleton()
export class UpdateTokenKeyController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateTokenKeyInCatalog: UpdateTokenKeyInCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(oldKey: string, newKey: string, tokenType: TokenType): void {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.stateV2.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateTokenKeyInCatalog.execute(base, oldKey, newKey, tokenType);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
