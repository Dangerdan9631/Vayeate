import type { Catalog } from '../../model/schemas';
import {
  saveCatalog as saveCatalogOp,
  type SetState,
} from '../../operations/catalog-operations';
import type { GetState } from '../../operations/undo-operations';
import { refreshRefsAndSelect } from './_helpers';

export async function lockCatalog(setState: SetState, getState: GetState): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog || catalog.type !== 'manual' || catalog.locked) return;
  const updated: Catalog = { ...catalog, locked: true };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, catalog.name, catalog.version);
}
