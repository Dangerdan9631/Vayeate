import { singleton } from 'tsyringe';
import { CatalogsStore, getCurrentCatalogRefs } from '../../catalog/state/catalogs-store';
import type { CatalogReference } from '../../../model/schema/template-schemas';

/** Read current catalog refs from state. Use in controllers instead of importing domain/state directly. */
@singleton()
export class GetCatalogRefsOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(): CatalogReference[] {
    return getCurrentCatalogRefs(this.catalogsStore.getStore().state.catalogs);
  }
}
