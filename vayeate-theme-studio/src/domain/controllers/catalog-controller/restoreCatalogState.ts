import type { Catalog } from '../../../model/schemas';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  setCatalog,
  deleteCatalog as deleteCatalogOp,
  refreshCatalogRefs,
  type SetState,
} from '../../operations/catalog-operations';

export async function restoreCatalogState(
  setState: SetState,
  setStoreState: SetStoreState,
  catalog: Catalog | null,
  deleteVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  setCatalog(setState, catalog);
  if (deleteVersionOnRestore) {
    await deleteCatalogOp(deleteVersionOnRestore.name, deleteVersionOnRestore.version);
    await refreshCatalogRefs(setStoreState);
  }
}
