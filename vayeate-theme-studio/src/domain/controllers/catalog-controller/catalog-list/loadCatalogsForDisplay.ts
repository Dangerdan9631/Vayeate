import {
  loadCatalogForDisplay as loadCatalogForDisplayOp,
  type SetState,
} from '../../../operations/catalog-operations';

export async function loadCatalogsForDisplay(
  setState: SetState,
  refs: Array<{ name: string; version: string }>,
): Promise<void> {
  for (const ref of refs) {
    await loadCatalogForDisplayOp(setState, ref.name, ref.version);
  }
}

