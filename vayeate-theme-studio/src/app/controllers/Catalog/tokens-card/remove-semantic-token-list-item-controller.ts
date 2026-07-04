import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import type { SemanticTokenRegistryListKind } from '../../../../model/Common/schema/primitives';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { RemoveSemanticTokenListItemOperation } from '../../../../domain/operations/Catalog/catalog-operations/tokens/remove-semantic-token-list-item-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/Catalog/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/Common/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Common/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/Common/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/Common/undo-history';
import { CATALOG_SEMANTIC_REGISTRY_ITEM_REMOVED } from '../../../../model/Common/undo-action-types';

/**
 * Removes one entry from a semantic token registry list on the selected catalog.
 */
@singleton()
export class RemoveSemanticTokenListItemController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly removeSemanticTokenListItem: RemoveSemanticTokenListItemOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Deletes the registry entry at the given index.
   * @param kind - Registry list being edited (types, modifiers, or languages).
   * @param index - Zero-based index within that list.
   */
  run(kind: SemanticTokenRegistryListKind, index: number): void {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.state.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!catalog) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: catalog.name, version: catalog.version },
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.removeSemanticTokenListItem.execute(base, kind, index);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version, updated, entityRefsChanged(catalog, updated));

    void this.recordCatalogUndo.execute({
      description: `Remove semantic ${kind} entry`,
      actionType: CATALOG_SEMANTIC_REGISTRY_ITEM_REMOVED,
      target: `${catalog.name}@${catalog.version}:${kind}:${index}`,
      before: catalog,
      after: updated,
    });
  }
}
