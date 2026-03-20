import type { Token } from '../../../../model/schemas';
import type { TokenType } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  setCatalogNewTokenKey,
  bumpCatalogVersionForEdit,
  addPlainTokenToCatalog,
  mergeSemanticSelectorsIntoCatalog,
  type SetState,
} from '../../../operations/catalog-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function addNewToken(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  tokenType: TokenType,
  key?: string,
): Promise<void> {
  const state = getState().catalogs;
  const catalog = state.catalog;
  const tokenKey = (key ?? state.newTokenKey)?.trim();
  if (!catalog || !tokenKey) return;

  if (tokenType === 'semantic token') {
    const base = bumpCatalogVersionForEdit(catalog);
    const merged = mergeSemanticSelectorsIntoCatalog(base, tokenKey);
    if (!merged) return;
    await saveCatalogOp(merged);
    await refreshRefsAndSelect(setState, setStoreState, merged.name, merged.version);
    setCatalogNewTokenKey(setState, '');
    return;
  }

  const newToken: Token = { key: tokenKey, type: tokenType };
  const base = bumpCatalogVersionForEdit(catalog);
  const updated = addPlainTokenToCatalog(base, newToken);
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
  setCatalogNewTokenKey(setState, '');
}
