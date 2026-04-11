import { singleton } from 'tsyringe';
import type { CatalogBulkAddParseSnapshot } from '../../../state/catalog/catalogs-state';
import { CatalogsStateGetter, CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';
import { parseThemeJson } from '../../../utils/theme-parser';

@singleton()
export class SetCatalogBulkAddTextOperation {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly catalogsStateSetter: CatalogsStateSetter,
  ) {}

  execute(value: string): void {
    const preview = this.computePreview(value);
    this.catalogsStateSetter.apply({ type: 'SET_CATALOG_BULK_ADD_TEXT', value, preview });
  }

  private computePreview(value: string): CatalogBulkAddParseSnapshot | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const catalog = this.catalogsStateGetter.current().catalog;
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

