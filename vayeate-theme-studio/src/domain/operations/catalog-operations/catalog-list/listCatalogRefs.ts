import { injectable } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

/** List catalog refs from disk without updating state. Single responsibility: read. */
@injectable()
export class ListCatalogRefs {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(): Promise<CatalogReference[]> {
    return this.catalogGateway.listCatalogs();
  }
}


