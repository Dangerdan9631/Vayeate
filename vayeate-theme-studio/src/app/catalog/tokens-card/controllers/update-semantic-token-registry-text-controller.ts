import type { SemanticTokenRegistryListKind } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { UpdateSemanticTokenRegistryEntryOperation } from '../../../../domain/operations/catalog-operations/tokens/update-semantic-token-registry-entry-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';

@singleton()
export class UpdateSemanticTokenRegistryTextController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSemanticTokenRegistryEntry: UpdateSemanticTokenRegistryEntryOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(kind: SemanticTokenRegistryListKind, index: number, value: string): void {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store);
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSemanticTokenRegistryEntry.execute(base, kind, index, value);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
