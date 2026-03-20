import { findHighestVersionRefSameName, nextPatchVersion } from '../../../utils/version';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  loadCatalogSnapshot,
  saveCatalog as saveCatalogOp,
  listCatalogRefs,
  revertCatalog,
  lockHeadCatalogIfUnlocked,
  type SetState,
} from '../../../operations/catalog-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function revertCatalogToVersion(
  setState: SetState,
  setStoreState: SetStoreState,
  name: string,
  version: string,
): Promise<void> {
  const snapshot = await loadCatalogSnapshot(name, version);
  if (!snapshot) return;

  const refs = await listCatalogRefs();
  const highestRef = findHighestVersionRefSameName(refs, name);

  if (highestRef) {
    const highestCatalog = await loadCatalogSnapshot(highestRef.name, highestRef.version);
    const toLock = lockHeadCatalogIfUnlocked(highestCatalog);
    if (toLock) {
      await saveCatalogOp(toLock);
    }
  }

  const newVersion = highestRef ? nextPatchVersion(highestRef.version) : nextPatchVersion(version);
  const reverted = revertCatalog(snapshot, newVersion);
  await saveCatalogOp(reverted);
  await refreshRefsAndSelect(setState, setStoreState, reverted.name, reverted.version);
}
