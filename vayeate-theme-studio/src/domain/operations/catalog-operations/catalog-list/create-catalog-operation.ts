import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { createCatalogWithParams } from '../../../../model/factories/catalog-factory';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

@singleton()
export class CreateCatalogOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(params: { name: string; type: 'manual' | 'remote' }): CatalogReference {
    this.catalogsStore.getStore().setIsCreating(true);
    try {
      const catalog = createCatalogWithParams(params);
      this.catalogsStore.getStore().setCatalogMapEntry(catalog.name, catalog.version, true, catalog);
      this.backgroundQueueGateway.enqueue(async() => {
        await this.catalogGateway.saveCatalog(catalog);
      }, `Saving catalog ${catalog.name} ${catalog.version}`);
      return { name: catalog.name, version: catalog.version };
    } finally {
      this.catalogsStore.getStore().setIsCreating(false);
    }
  }
}
