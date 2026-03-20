import type { TokenKey, TokenType } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  bumpCatalogVersionForEdit,
  removeTokenFromCatalog,
  type SetState,
} from '../../../operations/catalog-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function removeToken(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  key: TokenKey,
  tokenType: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog) return;
  const base = bumpCatalogVersionForEdit(catalog);
  const updated = removeTokenFromCatalog(base, key, tokenType);
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
}
