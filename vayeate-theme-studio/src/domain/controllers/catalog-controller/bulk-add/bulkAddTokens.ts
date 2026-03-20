import { parseThemeJson } from '../../../utils/theme-parser';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  setCatalogBulkAddDialogOpen,
  setCatalogBulkAddText,
  bumpCatalogVersionForEdit,
  deduplicateBulkTokens,
  appendTokensToCatalog,
  type SetState,
} from '../../../operations/catalog-operations';
import type { GetState } from '../../../operations/undo-operations';
import { canBulkAddTokens } from '../../../validations/catalog-validations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function bulkAddTokens(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
): Promise<void> {
  const state = getState().catalogs;
  const catalog = state.catalog;
  const text = state.bulkAddText?.trim();
  if (!canBulkAddTokens(catalog, text)) return;
  try {
    const result = parseThemeJson(text!);
    const unique = deduplicateBulkTokens(catalog, result.tokens);
    if (unique.length === 0) return;
    const base = bumpCatalogVersionForEdit(catalog);
    const updated = appendTokensToCatalog(base, unique);
    await saveCatalogOp(updated);
    await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
  } finally {
    setCatalogBulkAddDialogOpen(setState, false);
    setCatalogBulkAddText(setState, '');
  }
}
