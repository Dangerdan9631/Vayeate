import { singleton } from 'tsyringe';
import type { CatalogBulkAddParseSnapshot } from '../../../state/catalog/catalogs-state';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { parseThemeJson } from '../../../utils/theme-parser';

@singleton()
export class SetCatalogBulkAddTextOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
  ) {}

  execute(value: string): void {
    const preview = this.computePreview(value);
    this.catalogsStore.getStore().setBulkAddText(value);
    this.catalogsStore.getStore().setBulkAddParse(preview);
  }

  private computePreview(value: string): CatalogBulkAddParseSnapshot | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const catalog = this.catalogsStore.getStore().state.catalog;
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

