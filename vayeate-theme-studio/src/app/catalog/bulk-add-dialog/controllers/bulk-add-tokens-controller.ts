import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/catalog/catalogs-store';
import { BulkAddDialogStore } from '../../../../domain/state/bulk-add-dialog/bulk-add-dialog-store';
import { parseThemeJson } from '../../../../model/theme-import';
import { AppendTokensToCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/append-tokens-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { DeduplicateBulkTokensOperation } from '../../../../domain/operations/catalog-operations/tokens/deduplicate-bulk-tokens-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { ValidateCanBulkAddTokens } from '../../../../domain/catalog/validations/validate-can-bulk-add-tokens';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/catalog/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

@singleton()
export class BulkAddTokensController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly bulkAddDialogStore: BulkAddDialogStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly deduplicateBulkTokens: DeduplicateBulkTokensOperation,
    private readonly appendTokensToCatalog: AppendTokensToCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanBulkAddTokens: ValidateCanBulkAddTokens,
  ) {}

  run(): void {
    const store = this.catalogsStore.getStore();
    const bulkAddDialogStore = this.bulkAddDialogStore.getStore();
    const catalog = getCurrentCatalog(store.stateV2.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    const text = bulkAddDialogStore.state?.text?.trim();
    if (!catalog || !text || !this.validateCanBulkAddTokens.test(catalog, text)) return;
    try {
      const result = parseThemeJson(text!);
      const unique = this.deduplicateBulkTokens.execute(catalog, result.tokens);
      if (unique.length === 0) return;
      const base = this.bumpCatalogVersionForEdit.execute(catalog);
      const updated = this.appendTokensToCatalog.execute(base, unique);
      this.saveCatalog.execute(updated);
      this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
    } finally {
      bulkAddDialogStore.closeBulkAddDialog('OK');
    }
  }
}
