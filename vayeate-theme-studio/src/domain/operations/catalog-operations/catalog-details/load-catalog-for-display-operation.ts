import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@injectable()
export class LoadCatalogForDisplayOperation {
  constructor(
    private readonly CatalogsStateSetter: CatalogsStateSetter,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    const loaded = await this.catalogGateway.loadCatalog(name, version);
    this.CatalogsStateSetter.apply({ type: 'SET_LOADED_CATALOG_FOR_DISPLAY', name, version, catalog: loaded });
    return loaded;
  }
}



