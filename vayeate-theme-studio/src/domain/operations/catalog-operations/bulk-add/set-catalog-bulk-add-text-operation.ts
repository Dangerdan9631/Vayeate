import { singleton } from 'tsyringe';
import { CatalogsStore, getCurrentCatalog } from '../../../catalog/state/catalogs-store';
import { parseThemeJson } from '../../../../model/theme-import';

@singleton()
export class SetCatalogBulkAddTextOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
  ) {}

  execute(value: string): void {
    const preview = this.computePreview(value);
    this.catalogsStore.getStore().setBulkAddDialogData(value);
    if (preview) {
      this.catalogsStore.getStore().setBulkAddDialogMetrics(
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

    const catalog = getCurrentCatalog(this.catalogsStore.getStore());
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

