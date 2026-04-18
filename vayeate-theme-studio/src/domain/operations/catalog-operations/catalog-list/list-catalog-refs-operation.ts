import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

@singleton()
export class ListCatalogRefsOperation {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(): Promise<CatalogReference[]> {
    return this.catalogGateway.listCatalogs();
  }
}


