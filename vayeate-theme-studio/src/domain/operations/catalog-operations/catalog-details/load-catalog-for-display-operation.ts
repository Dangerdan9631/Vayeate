import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

@singleton()
export class LoadCatalogForDisplayOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(name: string, version: string): void {
    this.enqueueBackgroundAction.execute(async() => {
      const loaded = await this.catalogGateway.loadCatalog(name, version);
      if (loaded) {
        this.catalogsStore.getStore().updateCatalog(loaded);
      }
    }, `Loading catalog ${name} ${version}`);
  }
}



