import type { Catalog } from '../../model/schemas';
import { saveCatalog as saveCatalogOp, type SetState } from '../../operations/catalog-operations';
import { refreshRefsAndSelect } from './_helpers';

export async function saveCatalog(
  setState: SetState,
  catalog: Catalog,
): Promise<void> {
  await saveCatalogOp(catalog);
  await refreshRefsAndSelect(setState, catalog.name, catalog.version);
}
