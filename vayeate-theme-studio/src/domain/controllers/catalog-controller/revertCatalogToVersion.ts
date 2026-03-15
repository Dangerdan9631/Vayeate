import type { Catalog } from '../../../model/schemas';
import { compareVersions, nextPatchVersion } from '../../utils/version';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  loadCatalogSnapshot,
  saveCatalog as saveCatalogOp,
  listCatalogRefs,
  type SetState,
} from '../../operations/catalog-operations';
import { refreshRefsAndSelect } from './_helpers';

export async function revertCatalogToVersion(
  setState: SetState,
  setStoreState: SetStoreState,
  name: string,
  version: string,
): Promise<void> {
  const snapshot = await loadCatalogSnapshot(name, version);
  if (!snapshot) return;

  const refs = await listCatalogRefs();
  const sameNameRefs = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const highest = sameNameRefs.length > 0 ? sameNameRefs[sameNameRefs.length - 1] : null;

  if (highest) {
    const highestCatalog = await loadCatalogSnapshot(highest.name, highest.version);
    if (highestCatalog && !highestCatalog.locked) {
      await saveCatalogOp({ ...highestCatalog, locked: true });
    }
  }

  const newVersion = highest ? nextPatchVersion(highest.version) : nextPatchVersion(version);
  const reverted: Catalog = {
    ...snapshot,
    version: newVersion,
    locked: false,
  };
  await saveCatalogOp(reverted);
  await refreshRefsAndSelect(setState, setStoreState, reverted.name, reverted.version);
}
