import type { SemanticTokenRegistryListKind } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { UpdateSemanticTokenRegistryEntryOperation } from '../../../operations/catalog-operations/tokens/update-semantic-token-registry-entry-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class UpdateSemanticTokenRegistryTextController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSemanticTokenRegistryEntry: UpdateSemanticTokenRegistryEntryOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(kind: SemanticTokenRegistryListKind, index: number, value: string): Promise<void> {
    const catalog = this.catalogsStore.getStore().state.catalog;
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSemanticTokenRegistryEntry.execute(base, kind, index, value);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
