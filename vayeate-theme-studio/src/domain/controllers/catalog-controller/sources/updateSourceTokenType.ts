import type { TokenType } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  bumpCatalogVersionForEdit,
  updateSourceTokenTypeInCatalog,
  type SetState,
} from '../../../operations/catalog-operations';
import type { GetState } from '../../../operations/undo-operations';
import { canUpdateCatalogSource } from '../../../validations/catalog-validations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function updateSourceTokenType(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  sourceIndex: number,
  value: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!canUpdateCatalogSource(catalog, sourceIndex)) return;
  const base = bumpCatalogVersionForEdit(catalog);
  const updated = updateSourceTokenTypeInCatalog(base, sourceIndex, value);
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
}
