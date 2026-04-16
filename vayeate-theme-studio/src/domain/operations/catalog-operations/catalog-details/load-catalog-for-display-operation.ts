import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

@singleton()
export class LoadCatalogForDisplayOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(name: string, version: string): void {
    this.backgroundQueueGateway.enqueue(async() => {
      const loaded = await this.catalogGateway.loadCatalog(name, version);
      this.catalogsStore.getStore().setLoadedForDisplay(name, version, loaded);
    }, `Loading catalog ${name} ${version}`);
  }
}



