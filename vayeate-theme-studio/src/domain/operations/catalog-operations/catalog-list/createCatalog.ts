import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

@injectable()
export class CreateCatalog {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(params: { name: string; type: 'manual' | 'remote' }): Promise<Catalog> {
    const catalog = await this.catalogGateway.createCatalog(params);
    return catalog;
  }
}



