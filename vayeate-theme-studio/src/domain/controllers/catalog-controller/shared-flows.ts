import type { Catalog } from '../../../model/schemas';
import { nextPatchVersion } from '../../utils/version';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  setSelectedRef,
  loadCatalog,
  refreshCatalogRefs,
  type SetState,
} from '../../operations/catalog-operations';

export async function refreshRefsAndSelect(
  setState: SetState,
  setStoreState: SetStoreState,
  selectName?: string,
  selectVersion?: string,
): Promise<void> {
  const refs = await refreshCatalogRefs(setStoreState);
  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      setSelectedRef(setState, match);
      await loadCatalog(setState, match.name, match.version);
    }
  }
}

export function catalogWithVersionBump(catalog: Catalog): Catalog {
  return catalog.locked
    ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
    : catalog;
}
