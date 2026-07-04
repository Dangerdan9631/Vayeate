import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { BulkAddDialogStore } from '../../../../domain/state/Catalog/ui/bulk-add-dialog-store';
import { parseThemeJson } from '../../../../model/Theme/theme-import';
import { AppendTokensToCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/tokens/append-tokens-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { DeduplicateBulkTokensOperation } from '../../../../domain/operations/Catalog/catalog-operations/tokens/deduplicate-bulk-tokens-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/save-catalog-operation';
import { ValidateCanBulkAddTokens } from '../../../../domain/validations/Catalog/catalog/validate-can-bulk-add-tokens';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/Catalog/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/Catalog/catalog-undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/Common/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';
import { CATALOG_TOKENS_BULK_ADDED } from '../../../../model/Undo/undo-action-types';

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
