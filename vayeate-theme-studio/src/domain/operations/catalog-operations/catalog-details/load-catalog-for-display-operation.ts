import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

@singleton()
export class LoadCatalogForDisplayOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: EnqueueBackgroundActionOperation,
  ) {}

  execute(name: string, version: string): void {
    this.backgroundQueueGateway.execute(async() => {
      const loaded = await this.catalogGateway.loadCatalog(name, version);
      this.catalogsStore.getStore().setLoadedForDisplay(name, version, loaded);
    }, `Loading catalog ${name} ${version}`);
  }
}



