import type { Catalog } from '../../../model/schemas';
import type { SetStoreState } from '../../state/store-state-reducer';
import { saveCatalog as saveCatalogOp, type SetState } from '../../operations/catalog-operations';
import { refreshRefsAndSelect } from './_helpers';

export async function saveCatalog(
  setState: SetState,
  setStoreState: SetStoreState,
  catalog: Catalog,
): Promise<void> {
  await saveCatalogOp(catalog);
  await refreshRefsAndSelect(setState, setStoreState, catalog.name, catalog.version);
}
