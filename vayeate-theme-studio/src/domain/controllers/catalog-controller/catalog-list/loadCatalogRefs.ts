import type { SetStoreState } from '../../../state/store-state-reducer';
import { loadCatalogRefs as loadCatalogRefsOp, type SetState } from '../../../operations/catalog-operations';

export async function loadCatalogRefs(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await loadCatalogRefsOp(setState, setStoreState);
}

