import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/data/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { CatalogReference } from '../../../../model/schema/template-schemas';
import { Catalog } from '../../../../model/schema/catalog';
import { ContinuationHandler } from '../../../../app/core/background-queue/background-queue';

@singleton()
export class LoadCatalogForDisplayOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}
  
  execute(refs: CatalogReference[]): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      `Loading catalogs for display`,
      async () => {
        const loadedCatalogs: Catalog[] = [];
        for (const ref of refs) {
          const loaded = await this.catalogGateway.loadCatalog(ref.name, ref.version);
          if (loaded) {
            loadedCatalogs.push(loaded);
          }
        }
        this.catalogsStore.getStore().updateCatalogs(loadedCatalogs);
      }
    );
  }
}



