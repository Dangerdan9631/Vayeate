import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { parseThemeJson } from '../../../utils/theme-parser';
import { AppendTokensToCatalogOperation } from '../../../operations/catalog-operations/tokens/append-tokens-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { DeduplicateBulkTokensOperation } from '../../../operations/catalog-operations/tokens/deduplicate-bulk-tokens-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { SetCatalogBulkAddDialogOpenOperation } from '../../../operations/catalog-operations/bulk-add/set-catalog-bulk-add-dialog-open-operation';
import { SetCatalogBulkAddTextOperation } from '../../../operations/catalog-operations/bulk-add/set-catalog-bulk-add-text-operation';
import { ValidateCanBulkAddTokens } from '../../../validations/catalog-validations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

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

  async run(): Promise<void> {
    const catalog = this.catalogsStore.getStore().state.catalog;
    const text = this.catalogsStore.getStore().state.bulkAddText?.trim();
    if (!catalog || !text || !this.validateCanBulkAddTokens.test(catalog, text)) return;
    try {
      const result = parseThemeJson(text!);
      const unique = this.deduplicateBulkTokens.execute(catalog, result.tokens);
      if (unique.length === 0) return;
      const base = this.bumpCatalogVersionForEdit.execute(catalog);
      const updated = this.appendTokensToCatalog.execute(base, unique);
      await this.saveCatalog.execute(updated);
      await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
    } finally {
      this.setCatalogBulkAddDialogOpen.execute(false);
      this.setCatalogBulkAddText.execute('');
    }
  }
}
