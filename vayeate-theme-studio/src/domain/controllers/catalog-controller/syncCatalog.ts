import type { Catalog } from '../../../model/schemas';
import {
  saveCatalog as saveCatalogOp,
  syncCatalog as syncCatalogOp,
  type SetState,
} from '../../operations/catalog-operations';
import { refreshRefsAndSelect } from './_helpers';

export async function syncCatalog(setState: SetState, catalog: Catalog): Promise<void> {
  const synced = await syncCatalogOp(catalog);
  await saveCatalogOp(synced);
  await refreshRefsAndSelect(setState, synced.name, synced.version);
}
