import type { Catalog } from '../../../model/schemas';
import { catalogService } from '../../../gateway/services/catalog-service';
import type { SetState } from './types';

export async function createCatalog(
  _setState: SetState,
  params: { name: string; type: 'manual' | 'remote' },
): Promise<Catalog> {
  const catalog = await catalogService.createCatalog(params);
  return catalog;
}
