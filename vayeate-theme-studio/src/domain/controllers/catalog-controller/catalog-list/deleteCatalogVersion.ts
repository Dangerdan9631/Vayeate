import { findNearestVersionRef } from '../../../utils/version';
import { catalogStackId } from '../../../utils/stack-id';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  deleteCatalog as deleteCatalogOp,
  setSelectedRef,
  setCatalog,
  loadCatalog,
  refreshCatalogRefs,
  type SetState,
} from '../../../operations/catalog-operations';
import { setCurrentUndoStackId } from '../../../operations/undo-operations';

export async function deleteCatalogVersion(
  setState: SetState,
  setStoreState: SetStoreState,
  name: string,
  version: string,
): Promise<void> {
  await deleteCatalogOp(name, version);
  const refs = await refreshCatalogRefs(setStoreState);
  const next = findNearestVersionRef(refs, name, version);

  if (next) {
    setSelectedRef(setState, next);
    await loadCatalog(setState, next.name, next.version);
    setCurrentUndoStackId(setState, catalogStackId(next.name, next.version));
  } else {
    setSelectedRef(setState, null);
    setCatalog(setState, null);
    setCurrentUndoStackId(setState, null);
  }
}

