import type { Token } from '../../../../model/schema/catalog';
import type { TokenType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { AddPlainTokenToCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/add-plain-token-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { MergeSemanticSelectorsIntoCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/merge-semantic-selectors-into-catalog-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { SetCatalogNewTokenKeyOperation } from '../../../../domain/operations/catalog-operations/tokens/set-catalog-new-token-key-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/undo-history';
import { CATALOG_TOKEN_ADDED } from '../../../../model/undo-action-types';

@singleton()
export class AddNewTokenController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addPlainTokenToCatalog: AddPlainTokenToCatalogOperation,
    private readonly mergeSemanticSelectorsIntoCatalog: MergeSemanticSelectorsIntoCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  run(tokenType: TokenType, key?: string): void {
    const store = this.catalogsStore.getStore();
    const state = this.catalogUiStore.getStore().state;
    const catalog = getCurrentCatalog(store.state.catalogs, state.selectedRef);
    const tokenKey = (key ?? state.newTokenKey)?.trim();
    if (!catalog || !tokenKey) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: catalog.name, version: catalog.version },
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    if (tokenType === 'semantic token') {
      const base = this.bumpCatalogVersionForEdit.execute(catalog);
      const merged = this.mergeSemanticSelectorsIntoCatalog.execute(base, tokenKey);
      if (!merged) return;
      this.saveCatalog.execute(merged);
      this.refreshCatalogRefsAndSelect.execute(merged.name, merged.version, merged, entityRefsChanged(catalog, merged));
      this.setCatalogNewTokenKey.execute('');

      void this.recordCatalogUndo.execute({
        description: `Add semantic token ${tokenKey}`,
        actionType: CATALOG_TOKEN_ADDED,
        target: `${catalog.name}@${catalog.version}:${tokenType}:${tokenKey}`,
        before: catalog,
        after: merged,
      });
      return;
    }

    const newToken: Token = { key: tokenKey, type: tokenType };
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.addPlainTokenToCatalog.execute(base, newToken);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version, updated, entityRefsChanged(catalog, updated));
    this.setCatalogNewTokenKey.execute('');

    void this.recordCatalogUndo.execute({
      description: `Add ${tokenType} token ${tokenKey}`,
      actionType: CATALOG_TOKEN_ADDED,
      target: `${catalog.name}@${catalog.version}:${tokenType}:${tokenKey}`,
      before: catalog,
      after: updated,
    });
  }
}
