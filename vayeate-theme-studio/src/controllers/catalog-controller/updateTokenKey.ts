import type { Catalog } from '../../model/schemas';
import type { TokenType } from '../../model/schemas';
import {
  saveCatalog as saveCatalogOp,
  type SetState,
} from '../../operations/catalog-operations';
import type { GetState } from '../../operations/undo-operations';
import { catalogWithVersionBump, refreshRefsAndSelect } from './_helpers';

export async function updateTokenKey(
  setState: SetState,
  getState: GetState,
  oldKey: string,
  newKey: string,
  tokenType: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog) return;
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = {
    ...base,
    tokens: base.tokens.map((t) =>
      t.key === oldKey && t.type === tokenType ? { ...t, key: newKey } : t,
    ),
  };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}
