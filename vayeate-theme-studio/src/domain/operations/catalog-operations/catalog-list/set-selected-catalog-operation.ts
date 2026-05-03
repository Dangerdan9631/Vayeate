import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogsStore, getCurrentCatalog } from '../../../state/data/catalogs-store';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

@singleton()
export class SetSelectedCatalogOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(ref: CatalogReference | null): void {
    this.catalogUiStore.getStore().selectCatalog(ref);

    if (!ref || getCurrentCatalog(this.catalogsStore.getStore().stateV2.catalogs, ref)) return;

    this.enqueueBackgroundAction.execute(
      'data_io',
      `Loading catalog ${ref.name} ${ref.version}`,
      async () => {
        const catalog = await this.catalogGateway.loadCatalog(ref.name, ref.version);
        if (!catalog) return;
        this.catalogsStore.getStore().updateCatalog(catalog);
      },
    );
  }
}
