import type { Catalog } from '../../../model/schemas';
import { catalogService } from '../../../gateway/services/catalog-service';
import type { SetState } from './types';

export async function loadCatalog(
  setState: SetState,
  name: string,
  version: string,
): Promise<Catalog | null> {
  const loaded = await catalogService.loadCatalog(name, version);
  setState({ type: 'SET_CATALOG', catalog: loaded });
  return loaded;
}
