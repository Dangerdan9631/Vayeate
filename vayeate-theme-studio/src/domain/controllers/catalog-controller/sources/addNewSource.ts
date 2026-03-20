import type { Source } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  setCatalogNewSourceUrl,
  setCatalogNewSourceTokenType,
  setCatalogNewSourceType,
  bumpCatalogVersionForEdit,
  addSourceToCatalog,
  type SetState,
} from '../../../operations/catalog-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function addNewSource(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
): Promise<void> {
  const state = getState().catalogs;
  const catalog = state.catalog;
  const url = state.newSourceUrl?.trim();
  if (!catalog || !url) return;
  const source: Source = {
    url,
    type: state.newSourceType,
    tokenType: state.newSourceTokenType,
  };
  const base = bumpCatalogVersionForEdit(catalog);
  const updated = addSourceToCatalog(base, source);
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
  setCatalogNewSourceUrl(setState, '');
  setCatalogNewSourceTokenType(setState, 'theme');
  setCatalogNewSourceType(setState, 'default');
}
