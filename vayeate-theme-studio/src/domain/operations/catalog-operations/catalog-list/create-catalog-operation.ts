import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { createCatalogWithParams } from '../../../../model/factories/catalog-factory';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

@singleton()
export class CreateCatalogOperation {
  constructor(
    private readonly catalogsStateSetter: CatalogsStateSetter,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(params: { name: string; type: 'manual' | 'remote' }): CatalogReference {
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
      this.backgroundQueueGateway.enqueue(async() => {
        await this.catalogGateway.saveCatalog(catalog);
      }, `Saving catalog ${catalog.name} ${catalog.version}`);
      return { name: catalog.name, version: catalog.version };
    } finally {
      this.catalogsStateSetter.apply({ type: 'SET_IS_CREATING', value: false });
    }
  }
}
