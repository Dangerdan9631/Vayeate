import type { TokenType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { UpdateTokenKeyInCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/update-token-key-in-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { createUndoProcessor } from '../../../../domain/core/undo-processor';
import { RecordUndoEntryOperation } from '../../../../domain/operations/undo-operations/record-undo-entry-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';

@singleton()
export class UpdateTokenKeyController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateTokenKeyInCatalog: UpdateTokenKeyInCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(oldKey: string, newKey: string, tokenType: TokenType): Promise<void> {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.state.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!catalog) return;
    const trimmedNewKey = newKey.trim();
    const tokenExists = catalog.tokens.some((token) => token.key === oldKey && token.type === tokenType);
    if (!trimmedNewKey || trimmedNewKey === oldKey || !tokenExists) return;

    const context = deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: catalog.name, version: catalog.version },
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    });
    this.setCurrentUndoStackId.executeForContext(context);

    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateTokenKeyInCatalog.execute(base, oldKey, trimmedNewKey, tokenType);
    this.applyCatalogState(updated);

    await this.recordUndoEntry.execute({
      completed: true,
      description: `Rename ${oldKey} catalog token`,
      diffs: [{
        actionType: 'CATALOG_TOKEN_KEY_UPDATED',
        target: `${catalog.name}@${catalog.version}:${tokenType}:${oldKey}`,
        before: catalog,
        after: updated,
      }],
      processor: createUndoProcessor([{
        actionType: 'CATALOG_TOKEN_KEY_UPDATED',
        apply: (action) => this.applyCatalogState(action.after as Catalog),
        revert: (action) => this.applyCatalogState(action.before as Catalog),
      }]),
    });
  }

  private applyCatalogState(catalog: Catalog): void {
    this.catalogsStore.getStore().upsertCatalogs([catalog]);
    this.catalogUiStore.getStore().selectCatalog({ name: catalog.name, version: catalog.version });
    this.saveCatalog.execute(catalog);
    this.refreshCatalogRefsAndSelect.execute(catalog.name, catalog.version);
  }
}
