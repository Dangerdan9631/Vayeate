import type { TokenType } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  bumpCatalogVersionForEdit,
  updateTokenKeyInCatalog,
  type SetState,
} from '../../../operations/catalog-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function updateTokenKey(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  oldKey: string,
  newKey: string,
  tokenType: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog) return;
  const base = bumpCatalogVersionForEdit(catalog);
  const updated = updateTokenKeyInCatalog(base, oldKey, newKey, tokenType);
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
}
