import type { Catalog } from '../../../model/schemas';
import type { TokenType } from '../../../model/schemas';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  type SetState,
} from '../../operations/catalog-operations';
import type { GetState } from '../../operations/undo-operations';
import { catalogWithVersionBump, refreshRefsAndSelect } from './_helpers';

export async function updateSourceTokenType(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  sourceIndex: number,
  value: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog || sourceIndex < 0 || sourceIndex >= catalog.sources.length) return;
  const sources = catalog.sources.map((s, i) =>
    i === sourceIndex ? { ...s, tokenType: value } : s,
  );
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = { ...base, sources };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
}
