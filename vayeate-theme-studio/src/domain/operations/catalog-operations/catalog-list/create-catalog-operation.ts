import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

@singleton()
export class CreateCatalogOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(params: { name: string; type: 'manual' | 'remote' }): CatalogReference {
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
    this.enqueueBackgroundAction.execute(async() => {
      await this.catalogGateway.saveCatalog(catalog);
    }, `Saving catalog ${catalog.name} ${catalog.version}`);
    return ref;
  }
}
