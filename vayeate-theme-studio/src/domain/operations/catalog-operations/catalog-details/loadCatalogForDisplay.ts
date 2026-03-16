import type { Catalog } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';
import type { SetState } from '../types';

export async function loadCatalogForDisplay(
  setState: SetState,
  name: string,
  version: string,
): Promise<Catalog | null> {
  const loaded = await catalogService.loadCatalog(name, version);
  setState({ type: 'SET_LOADED_CATALOG_FOR_DISPLAY', name, version, catalog: loaded });
  return loaded;
}



