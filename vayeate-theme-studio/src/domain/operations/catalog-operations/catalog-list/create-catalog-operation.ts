import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { createCatalogWithParams } from '../../../../model/factories/catalog-factory';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

@singleton()
export class CreateCatalogOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: EnqueueBackgroundActionOperation,
  ) {}

  execute(params: { name: string; type: 'manual' | 'remote' }): CatalogReference {
    this.catalogsStore.getStore().setIsCreating(true);
    try {
      const catalog = createCatalogWithParams(params);
      this.catalogsStore.getStore().setCatalogMapEntry(catalog.name, catalog.version, true, catalog);
      this.backgroundQueueGateway.execute(async() => {
        await this.catalogGateway.saveCatalog(catalog);
      }, `Saving catalog ${catalog.name} ${catalog.version}`);
      return { name: catalog.name, version: catalog.version };
    } finally {
      this.catalogsStore.getStore().setIsCreating(false);
    }
  }
}
