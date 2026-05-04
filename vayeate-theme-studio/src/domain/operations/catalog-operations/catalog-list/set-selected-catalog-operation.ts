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
    this.catalogUiStore.getStore().setCatalogLoadState(ref ? 'loading' : 'unloaded');

    if (!ref) return;

    if (getCurrentCatalog(this.catalogsStore.getStore().state.catalogs, ref)) {
      this.catalogUiStore.getStore().setCatalogLoadState('loaded');
      return;
    }

    this.enqueueBackgroundAction.execute(
      'data_io',
      `Loading catalog ${ref.name} ${ref.version}`,
      async () => {
        const catalog = await this.catalogGateway.loadCatalog(ref.name, ref.version);
        if (!catalog) return;
        this.catalogsStore.getStore().updateCatalog(catalog);
        const selectedRef = this.catalogUiStore.getStore().state.selectedRef;
        if (selectedRef?.name === ref.name && selectedRef.version === ref.version) {
          this.catalogUiStore.getStore().setCatalogLoadState('loaded');
        }
      },
    );
  }
}
