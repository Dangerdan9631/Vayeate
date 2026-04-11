import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { createCatalogWithParams } from '../../../../model/factories/catalog-factory';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@singleton()
export class CreateCatalogOperation {
  constructor(
    private readonly catalogsStateSetter: CatalogsStateSetter,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(params: { name: string; type: 'manual' | 'remote' }): Promise<CatalogReference> {
    this.catalogsStateSetter.apply({ type: 'SET_IS_CREATING', value: true });
    try {
      const catalog = createCatalogWithParams(params);
      this.catalogsStateSetter.apply({
        type: 'SET_CATALOG_MAP_ENTRY',
        name: catalog.name,
        version: catalog.version,
        isLoaded: true,
        catalog,
      });
      await this.catalogGateway.saveCatalog(catalog);
      return { name: catalog.name, version: catalog.version };
    } finally {
      this.catalogsStateSetter.apply({ type: 'SET_IS_CREATING', value: false });
    }
  }
}
