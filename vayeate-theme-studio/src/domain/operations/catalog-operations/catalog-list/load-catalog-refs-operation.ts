import { injectable } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

/** Load catalog refs from data dir into store (set catalog entries from ref list). */
@injectable()
export class LoadCatalogRefsOperation {
  constructor(
    private readonly catalogsStateSetter: CatalogsStateSetter,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(): Promise<void> {
    const refs = await this.catalogGateway.listCatalogs();
    this.catalogsStateSetter.apply({
      type: 'SET_CATALOG_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
    });
  }
}



