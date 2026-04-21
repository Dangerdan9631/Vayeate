import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogsStore, getCurrentCatalog } from '../../../catalog/state/catalogs-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

@singleton()
export class SetSelectedCatalogOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(ref: CatalogReference | null): void {
    this.catalogsStore.getStore().selectCatalog(ref);

    if (!ref || getCurrentCatalog(this.catalogsStore.getStore())) return;

    this.enqueueBackgroundAction.execute(async () => {
      const catalog = await this.catalogGateway.loadCatalog(ref.name, ref.version);
      if (!catalog) return;
      this.catalogsStore.getStore().updateCatalog(catalog);
    }, `Loading catalog ${ref.name} ${ref.version}`);
  }
}
