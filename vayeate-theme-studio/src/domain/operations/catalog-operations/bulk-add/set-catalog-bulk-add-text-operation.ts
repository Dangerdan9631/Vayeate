import { singleton } from 'tsyringe';
import { CatalogsStore, getCurrentCatalog } from '../../../state/catalog/catalogs-store';
import { parseThemeJson } from '../../../../model/theme-import';
import { BulkAddDialogStore } from '../../../state/bulk-add-dialog/bulk-add-dialog-store';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

@singleton()
export class SetCatalogBulkAddTextOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly bulkAddDialogStore: BulkAddDialogStore,
  ) {}

  execute(value: string): void {
    const preview = this.computePreview(value);
    this.bulkAddDialogStore.getStore().setBulkAddDialogData(value);
    if (preview) {
      this.bulkAddDialogStore.getStore().setBulkAddDialogMetrics(
        preview.errorMessage,
        preview.counts,
        preview.newCount,
        preview.duplicateCount
      );
    }
  }

  private computePreview(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const catalog = getCurrentCatalog(
      this.catalogsStore.getStore().stateV2.catalogs,
      this.catalogUiStore.getStore().state.selectedRef,
    );
    const existingTokenKeys = new Set(
      catalog ? catalog.tokens.map((t) => `${t.type}::${t.key}`) : [],
    );

    try {
      const result = parseThemeJson(trimmed);
      const newCount = result.tokens.filter((t) => !existingTokenKeys.has(`${t.type}::${t.key}`)).length;
      const duplicateCount = result.tokens.length - newCount;
      return {
        errorMessage: null,
        counts: result.counts,
        newCount,
        duplicateCount,
      };
    } catch (e) {
      return {
        errorMessage: e instanceof Error ? e.message : String(e),
        counts: null,
        newCount: 0,
        duplicateCount: 0,
      };
    }
  }
}

