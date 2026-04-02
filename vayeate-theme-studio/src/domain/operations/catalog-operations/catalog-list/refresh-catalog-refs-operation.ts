import { injectable } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

/** List catalogs and set entries in store. Single responsibility: refresh ref list. */
@injectable()
export class RefreshCatalogRefsOperation {
  constructor(
    private readonly catalogsStateSetter: CatalogsStateSetter,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(): Promise<CatalogReference[]> {
    const refs = await this.catalogGateway.listCatalogs();
    this.catalogsStateSetter.apply({
      type: 'SET_CATALOG_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
    });
    return refs;
  }
}


