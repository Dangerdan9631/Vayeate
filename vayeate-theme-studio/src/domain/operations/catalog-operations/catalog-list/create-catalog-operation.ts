import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { CatalogType } from '../../../../model/schema/primitives';

@singleton()
export class CreateCatalogOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(params: { name: string; type: CatalogType }): CatalogReference {
    const catalog = {
      name: params.name,
      version: '1.0.0',
      type: params.type,
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    const ref = { name: catalog.name, version: catalog.version };
    this.catalogsStore.getStore().updateCatalog(catalog);
    this.enqueueBackgroundAction.execute(
      `Saving catalog ${catalog.name} ${catalog.version}`,
      async () => {
        await this.catalogGateway.saveCatalog(catalog);
      }
    );
    return ref;
  }
}
