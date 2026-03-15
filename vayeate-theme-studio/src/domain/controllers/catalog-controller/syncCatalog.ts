import type { Catalog } from '../../../model/schemas';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  syncCatalog as syncCatalogOp,
  type SetState,
} from '../../operations/catalog-operations';
import { refreshRefsAndSelect } from './shared-flows';

export async function syncCatalog(setState: SetState, setStoreState: SetStoreState, catalog: Catalog): Promise<void> {
  const synced = await syncCatalogOp(catalog);
  await saveCatalogOp(synced);
  await refreshRefsAndSelect(setState, setStoreState, synced.name, synced.version);
}
