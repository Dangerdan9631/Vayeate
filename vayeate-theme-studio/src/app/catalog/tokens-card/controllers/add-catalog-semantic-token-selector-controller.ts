import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { MergeSemanticSelectorsIntoCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/merge-semantic-selectors-into-catalog-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { SetCatalogNewSemanticTokenSelectorTextOperation } from '../../../../domain/operations/catalog-operations/tokens/set-catalog-new-semantic-token-selector-text-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/undo-history';
import { CATALOG_SEMANTIC_SELECTOR_ADDED } from '../../../../model/undo-action-types';

/**
 * Merges a typed semantic selector string into the catalog registry lists.
 */
@singleton()
export class AddCatalogSemanticTokenSelectorController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly mergeSemanticSelectorsIntoCatalog: MergeSemanticSelectorsIntoCatalogOperation,
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Adds the pending semantic selector when it parses and merges successfully.
   */
  run(): void {
    const store = this.catalogsStore.getStore();
    const state = this.catalogUiStore.getStore().state;
    const catalog = getCurrentCatalog(store.state.catalogs, state.selectedRef);
    const selector = state.newSemanticTokenSelectorText?.trim();
    if (!catalog || !selector) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: catalog.name, version: catalog.version },
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const merged = this.mergeSemanticSelectorsIntoCatalog.execute(base, selector);
    if (!merged) return;

    this.saveCatalog.execute(merged);
    this.refreshCatalogRefsAndSelect.execute(merged.name, merged.version, merged, entityRefsChanged(catalog, merged));
    this.setCatalogNewSemanticTokenSelectorText.execute('');

    void this.recordCatalogUndo.execute({
      description: `Add semantic selector ${selector}`,
      actionType: CATALOG_SEMANTIC_SELECTOR_ADDED,
      target: `${catalog.name}@${catalog.version}:semantic:${selector}`,
      before: catalog,
      after: merged,
    });
  }
}
