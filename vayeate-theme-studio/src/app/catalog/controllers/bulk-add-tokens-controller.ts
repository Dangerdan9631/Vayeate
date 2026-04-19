import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../domain/state/catalog/catalogs-store';
import { parseThemeJson } from '../../../domain/utils/theme-parser';
import { AppendTokensToCatalogOperation } from '../../../domain/operations/catalog-operations/tokens/append-tokens-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { DeduplicateBulkTokensOperation } from '../../../domain/operations/catalog-operations/tokens/deduplicate-bulk-tokens-operation';
import { SaveCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { SetCatalogBulkAddDialogOpenOperation } from '../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-dialog-open-operation';
import { SetCatalogBulkAddTextOperation } from '../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-text-operation';
import { ValidateCanBulkAddTokens } from '../../../domain/validations/catalog-validations/validate-can-bulk-add-tokens';
import { RefreshCatalogRefsAndSelectOperation } from '../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class BulkAddTokensController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly setCatalogBulkAddDialogOpen: SetCatalogBulkAddDialogOpenOperation,
    private readonly setCatalogBulkAddText: SetCatalogBulkAddTextOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly deduplicateBulkTokens: DeduplicateBulkTokensOperation,
    private readonly appendTokensToCatalog: AppendTokensToCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanBulkAddTokens: ValidateCanBulkAddTokens,
  ) {}

  run(): void {
    const catalog = this.catalogsStore.getStore().state.catalog;
    const text = this.catalogsStore.getStore().state.bulkAddText?.trim();
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
      this.setCatalogBulkAddDialogOpen.execute(false);
      this.setCatalogBulkAddText.execute('');
    }
  }
}
