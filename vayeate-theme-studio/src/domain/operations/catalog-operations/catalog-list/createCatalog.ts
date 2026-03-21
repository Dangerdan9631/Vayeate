import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogService } from '../../../../gateway/services/catalog-service';

@injectable()
export class CreateCatalog {
  constructor(private readonly catalogService: CatalogService) {}

  async execute(params: { name: string; type: 'manual' | 'remote' }): Promise<Catalog> {
    const catalog = await this.catalogService.createCatalog(params);
    return catalog;
  }
}



