import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class LoadCatalogForDisplayOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): void {
    this.enqueueBackgroundAction.execute(
      `Loading catalog ${name} ${version}`,
      async () => {
        const loaded = await this.catalogGateway.loadCatalog(name, version);
        if (loaded) {
          this.catalogsStore.getStore().updateCatalog(loaded);
        }
      },
      undefined,
      'worker'
    );
  }
}



