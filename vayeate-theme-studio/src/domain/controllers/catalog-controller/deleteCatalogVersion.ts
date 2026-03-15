import { compareVersions } from '../../utils/version';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  deleteCatalog as deleteCatalogOp,
  setSelectedRef,
  setCatalog,
  loadCatalog,
  refreshCatalogRefs,
  type SetState,
} from '../../operations/catalog-operations';
import { setCurrentUndoStackId } from '../../operations/undo-operations';
import { catalogStackId } from './catalogStackId';

export async function deleteCatalogVersion(
  setState: SetState,
  setStoreState: SetStoreState,
  name: string,
  version: string,
): Promise<void> {
  await deleteCatalogOp(name, version);
  const refs = await refreshCatalogRefs(setStoreState);

  const sameNameRefs = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const lower = sameNameRefs.filter((r) => compareVersions(r.version, version) < 0);
  const higher = sameNameRefs.filter((r) => compareVersions(r.version, version) > 0);
  const next = lower.length > 0 ? lower[lower.length - 1] : higher.length > 0 ? higher[0] : null;

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
