import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  applyLockToCatalog,
  type SetState,
} from '../../../operations/catalog-operations';
import type { GetState } from '../../../operations/undo-operations';
import { canLockCatalog } from '../../../validations/catalog-validations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function lockCatalog(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!canLockCatalog(catalog)) return;
  const updated = applyLockToCatalog(catalog);
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, catalog.name, catalog.version);
}
