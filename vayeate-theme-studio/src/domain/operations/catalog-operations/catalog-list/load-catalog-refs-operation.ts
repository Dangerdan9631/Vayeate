import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

@singleton()
export class LoadCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(): void {
    this.enqueueBackgroundAction.execute(async() => {
      const refs = await this.catalogGateway.listCatalogs();
      this.catalogsStore.getStore().updateCatalogRefs(refs);
    }, 'Loading catalogs');
  }
}
