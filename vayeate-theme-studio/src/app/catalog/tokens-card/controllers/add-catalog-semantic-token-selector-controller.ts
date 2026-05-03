import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/data/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { MergeSemanticSelectorsIntoCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/merge-semantic-selectors-into-catalog-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { SetCatalogNewSemanticTokenSelectorTextOperation } from '../../../../domain/operations/catalog-operations/tokens/set-catalog-new-semantic-token-selector-text-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/data/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

@singleton()
export class AddCatalogSemanticTokenSelectorController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly mergeSemanticSelectorsIntoCatalog: MergeSemanticSelectorsIntoCatalogOperation,
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(): void {
    const store = this.catalogsStore.getStore();
    const state = this.catalogUiStore.getStore().state;
    const catalog = getCurrentCatalog(store.stateV2.catalogs, state.selectedRef);
    const selector = state.newSemanticTokenSelectorText?.trim();
    if (!catalog || !selector) return;

    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const merged = this.mergeSemanticSelectorsIntoCatalog.execute(base, selector);
    if (!merged) return;

    this.saveCatalog.execute(merged);
    this.refreshCatalogRefsAndSelect.execute(merged.name, merged.version);
    this.setCatalogNewSemanticTokenSelectorText.execute('');
  }
}
