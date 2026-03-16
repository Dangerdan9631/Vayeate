import {
  loadCatalogForDisplay as loadCatalogForDisplayOp,
  type SetState,
} from '../../../operations/catalog-operations';

export async function loadCatalogForDisplay(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await loadCatalogForDisplayOp(setState, name, version);
}

