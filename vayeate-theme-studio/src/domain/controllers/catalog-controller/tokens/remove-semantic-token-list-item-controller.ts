import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import type { SemanticTokenRegistryListKind } from '../../../../model/schemas';
import { BumpCatalogVersionForEditOperation } from '../../../operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { RemoveSemanticTokenListItemOperation } from '../../../operations/catalog-operations/tokens/remove-semantic-token-list-item-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class RemoveSemanticTokenListItemController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly removeSemanticTokenListItem: RemoveSemanticTokenListItemOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(kind: SemanticTokenRegistryListKind, index: number): Promise<void> {
    const catalog = this.catalogsStore.getStore().state.catalog;
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.removeSemanticTokenListItem.execute(base, kind, index);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
