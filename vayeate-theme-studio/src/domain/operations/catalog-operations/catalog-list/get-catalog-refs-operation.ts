import { injectable } from 'tsyringe';
import { getCatalogRefsFromCatalogsState } from '../../../state/catalog/catalogs-state';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';

/** Read current catalog refs from state. Use in controllers instead of importing domain/state directly. */
@injectable()
export class GetCatalogRefsOperation {
  constructor(private readonly catalogsStateGetter: CatalogsStateGetter) {}

  execute(): CatalogReference[] {
    return getCatalogRefsFromCatalogsState(this.catalogsStateGetter.current());
  }
}
