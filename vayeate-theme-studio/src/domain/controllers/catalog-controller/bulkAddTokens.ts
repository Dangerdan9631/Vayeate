import type { Catalog } from '../../../model/schemas';
import { parseThemeJson } from '../../utils/theme-parser';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  setCatalogBulkAddDialogOpen,
  setCatalogBulkAddText,
  type SetState,
} from '../../operations/catalog-operations';
import type { GetState } from '../../operations/undo-operations';
import { catalogWithVersionBump, refreshRefsAndSelect } from './shared-flows';

export async function bulkAddTokens(setState: SetState, setStoreState: SetStoreState, getState: GetState): Promise<void> {
  const state = getState().catalogs;
  const catalog = state.catalog;
  const text = state.bulkAddText?.trim();
  if (!catalog || !text) return;
  try {
    const result = parseThemeJson(text);
    const existingKeys = new Set(catalog.tokens.map((t) => `${t.type}::${t.key}`));
    const unique = result.tokens.filter((t) => !existingKeys.has(`${t.type}::${t.key}`));
    if (unique.length === 0) return;
    const base = catalogWithVersionBump(catalog);
    const updated: Catalog = { ...base, tokens: [...base.tokens, ...unique] };
    await saveCatalogOp(updated);
    await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
  } finally {
    setCatalogBulkAddDialogOpen(setState, false);
    setCatalogBulkAddText(setState, '');
  }
}
