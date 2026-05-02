import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class RefreshCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(): Promise<CatalogReference[]> {
    const refs = await this.catalogGateway.listCatalogs();
    this.catalogsStore.getStore().updateCatalogRefs(refs);
    return refs;
  }
}


