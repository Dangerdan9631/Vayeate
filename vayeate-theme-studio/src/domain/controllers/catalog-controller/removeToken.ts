import type { Catalog } from '../../../model/schemas';
import type { TokenKey, TokenType } from '../../../model/schemas';
import {
  saveCatalog as saveCatalogOp,
  type SetState,
} from '../../operations/catalog-operations';
import type { GetState } from '../../operations/undo-operations';
import { catalogWithVersionBump, refreshRefsAndSelect } from './_helpers';

export async function removeToken(
  setState: SetState,
  getState: GetState,
  key: TokenKey,
  tokenType: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog) return;
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = {
    ...base,
    tokens: base.tokens.filter((t) => !(t.key === key && t.type === tokenType)),
  };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}
