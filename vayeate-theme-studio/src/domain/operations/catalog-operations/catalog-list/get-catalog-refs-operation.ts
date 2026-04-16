import { singleton } from 'tsyringe';
import { getCatalogRefsFromCatalogMap } from '../../../state/catalog/catalogs-state';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

/** Read current catalog refs from state. Use in controllers instead of importing domain/state directly. */
@singleton()
export class GetCatalogRefsOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(): CatalogReference[] {
    return getCatalogRefsFromCatalogMap(this.catalogsStore.getStore().state.catalogMap);
  }
}
