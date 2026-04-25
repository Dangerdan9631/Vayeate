import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import type { SemanticTokenRegistryListKind } from '../../../../model/schema/primitives';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { RemoveSemanticTokenListItemOperation } from '../../../../domain/operations/catalog-operations/tokens/remove-semantic-token-list-item-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';

@singleton()
export class RemoveSemanticTokenListItemController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly removeSemanticTokenListItem: RemoveSemanticTokenListItemOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(kind: SemanticTokenRegistryListKind, index: number): void {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store);
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.removeSemanticTokenListItem.execute(base, kind, index);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
