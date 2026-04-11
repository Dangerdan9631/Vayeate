import { singleton } from 'tsyringe';
import { getCatalogRefsFromCatalogMap } from '../../../state/catalog/catalogs-state';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';

/** Read current catalog refs from state. Use in controllers instead of importing domain/state directly. */
@singleton()
export class GetCatalogRefsOperation {
  constructor(private readonly catalogsStateGetter: CatalogsStateGetter) {}

  execute(): CatalogReference[] {
    return getCatalogRefsFromCatalogMap(this.catalogsStateGetter.current().catalogMap);
  }
}
