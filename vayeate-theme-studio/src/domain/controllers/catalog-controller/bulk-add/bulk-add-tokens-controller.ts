import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import { parseThemeJson } from '../../../utils/theme-parser';
import {
  AppendTokensToCatalogOperation,
  BumpCatalogVersionForEditOperation,
  DeduplicateBulkTokensOperation,
  SaveCatalogOperation,
  SetCatalogBulkAddDialogOpenOperation,
  SetCatalogBulkAddTextOperation,
} from '../../../operations/catalog-operations';
import { canBulkAddTokens } from '../../../validations/catalog-validations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class BulkAddTokensController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly setCatalogBulkAddDialogOpen: SetCatalogBulkAddDialogOpenOperation,
    private readonly setCatalogBulkAddText: SetCatalogBulkAddTextOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly deduplicateBulkTokens: DeduplicateBulkTokensOperation,
    private readonly appendTokensToCatalog: AppendTokensToCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(): Promise<void> {
    const state = this.appStateGetter.current().catalogs;
    const catalog = state.catalog;
    const text = state.bulkAddText?.trim();
    if (!canBulkAddTokens(catalog, text)) return;
    try {
      const result = parseThemeJson(text!);
      const unique = this.deduplicateBulkTokens.execute(catalog, result.tokens);
      if (unique.length === 0) return;
      const base = this.bumpCatalogVersionForEdit.execute(catalog);
      const updated = this.appendTokensToCatalog.execute(base, unique);
      await this.saveCatalog.execute(updated);
      await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
    } finally {
      this.setCatalogBulkAddDialogOpen.execute(false);
      this.setCatalogBulkAddText.execute('');
    }
  }
}
