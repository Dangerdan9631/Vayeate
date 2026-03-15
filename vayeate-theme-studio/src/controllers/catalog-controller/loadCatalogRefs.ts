import { loadCatalogRefs as loadCatalogRefsOp, type SetState } from '../../operations/catalog-operations';

export async function loadCatalogRefs(setState: SetState): Promise<void> {
  await loadCatalogRefsOp(setState);
}
