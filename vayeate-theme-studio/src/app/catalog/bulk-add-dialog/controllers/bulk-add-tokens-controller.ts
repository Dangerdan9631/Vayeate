import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { BulkAddDialogStore } from '../../../../domain/state/ui/bulk-add-dialog-store';
import { parseThemeJson } from '../../../../model/theme-import';
import { AppendTokensToCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/append-tokens-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { DeduplicateBulkTokensOperation } from '../../../../domain/operations/catalog-operations/tokens/deduplicate-bulk-tokens-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { ValidateCanBulkAddTokens } from '../../../../domain/catalog/validations/validate-can-bulk-add-tokens';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/undo-history';
import { CATALOG_TOKENS_BULK_ADDED } from '../../../../model/undo-action-types';

/**
 * Parses pasted theme JSON and appends deduplicated tokens to the selected catalog.
 */
@singleton()
export class BulkAddTokensController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly bulkAddDialogStore: BulkAddDialogStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly deduplicateBulkTokens: DeduplicateBulkTokensOperation,
    private readonly appendTokensToCatalog: AppendTokensToCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanBulkAddTokens: ValidateCanBulkAddTokens,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Imports new tokens from the dialog text and closes the bulk-add dialog.
   */
  run(): void {
    const store = this.catalogsStore.getStore();
    const bulkAddDialogStore = this.bulkAddDialogStore.getStore();
    const catalog = getCurrentCatalog(store.state.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    const text = bulkAddDialogStore.state?.text?.trim();
    if (!catalog || !text || !this.validateCanBulkAddTokens.test(catalog, text)) return;
    try {
      const result = parseThemeJson(text!);
      const unique = this.deduplicateBulkTokens.execute(catalog, result.tokens);
      if (unique.length === 0) return;

      this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
        tabId: 'catalogs',
        catalogRef: { name: catalog.name, version: catalog.version },
        templateRef: this.templateUiStore.getStore().state.selectedRef,
        themeRef: this.themeUiStore.getStore().state.selectedRef,
      }));

      const base = this.bumpCatalogVersionForEdit.execute(catalog);
      const updated = this.appendTokensToCatalog.execute(base, unique);
      this.saveCatalog.execute(updated);
      this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version, updated, entityRefsChanged(catalog, updated));

      void this.recordCatalogUndo.execute({
        description: `Bulk add ${unique.length} catalog tokens`,
        actionType: CATALOG_TOKENS_BULK_ADDED,
        target: `${catalog.name}@${catalog.version}`,
        before: catalog,
        after: updated,
      });
    } finally {
      bulkAddDialogStore.closeBulkAddDialog('OK');
    }
  }
}
